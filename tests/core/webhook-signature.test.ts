import { createHmac, timingSafeEqual } from "crypto";
import { verifyWebhookSignature } from "../../src/core/webhook-signature";

/**
 * 
 * @param body - The body to sign.
 * @param secret - The secret to sign the body with.
 * @param timestamp - The timestamp to sign the body with.
 * @returns The signed body.
 */
const sign = (body: string, secret: string, timestamp: number): string => {
  const payload = `${timestamp}.${body}`; 
  const v1 = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  
  return `t=${timestamp},v1=${v1}`;
}

// Happy path
const body = '{"type":"guest.updated","data":{}}';
const secret = "whsec_test";
const timestamp = Math.floor(Date.now() / 1000);

verifyWebhookSignature({
  body,
  secret,
  headers: { "Webhook-Signature": sign(body, secret, timestamp) },
}); // no throw
// Tampered body → WebhookSignatureError
// Wrong secret → WebhookSignatureError
// Expired timestamp (e.g. timestamp - 600) → WebhookSignatureError
// Missing header → WebhookSignatureError