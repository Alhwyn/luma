/// <reference types="node" />
import { createHmac, timingSafeEqual } from "crypto";
import { WebhookSignatureError } from "./errors"; 


const DEFAULT_TOLERANCE_SECONDS = 300;
const SIGNATURE_HEADER          = "webhook-signature";

export type VerifyWebhookSignatureParams = {
  body: string | Uint8Array;
  headers: Headers | Record<string, string | string[] | undefined>;
  secret: string;
  tolerance?: number; 
};

/**
 * 
 * @param headers - The headers to get the header from.
 * @param name - The name of the header to get.
 * @returns The value of the header.
 */
export const getWebhookHeader = (
  headers: Headers | Record<string, string | string[] | undefined>,
  name: string,
): string | undefined => {

  if (headers instanceof Headers) return headers.get(name) ?? undefined;

  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());

  if (!key) return undefined;

  const value = headers[key]; 

  return Array.isArray(value) ? value[0] : value;
}

/**
 * 
 * @param body - The body to convert to a string.
 * @returns The body as a string.
 */
const bodyToString = (body: string | Uint8Array): string => {
  return typeof body === "string" ? body : new TextDecoder().decode(body);
}

const parseSignatureHeader = (headers: string): { timestamp: number, v1: string } => {
  const parts = Object.fromEntries(
    headers.split(",").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  );

  const timestamp = Number(parts.t);
  const v1 = parts.v1; 

  if (!Number.isFinite(timestamp) || !v1) throw new WebhookSignatureError("Invalid Webhook-Signature header format");

  return { timestamp, v1 };
}

/**
 * 
 * @param expected - The expected value to compare.
 * @param actual - The actual value to compare.
 * @returns true if the values are the same, false otherwise.
 */
const secureCompareHex = (expected: string, actual: string): boolean => {
  const expectedBuf = Buffer.from(expected, "hex"); 
  const actualBuf   = Buffer.from(actual, "hex");  

  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf); 
}

/**
 * 
 * @param params - The parameters to verify the webhook signature.
 * @returns void
 * @throws WebhookSignatureError if the webhook signature is invalid.
 */
export const verifyWebhookSignature = (params: VerifyWebhookSignatureParams): void => {
  const { secret, tolerance = DEFAULT_TOLERANCE_SECONDS } = params; 

  const signatureHeader = getWebhookHeader(params.headers, SIGNATURE_HEADER); 

  if (!signatureHeader) throw new WebhookSignatureError("Missing Webhook-Signature header");

  const { timestamp, v1 } = parseSignatureHeader(signatureHeader);  
  const now = Math.floor(Date.now() / 1000); 

  if (now - timestamp > tolerance) throw new WebhookSignatureError("Timestamp outside tolerance");

  const rawBody = bodyToString(params.body);
  const signedPayload = `${timestamp}.${rawBody}`; 

  const expectedSignature = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex"); 
  
  if (!secureCompareHex(expectedSignature, v1)) throw new WebhookSignatureError("Invalid Webhook-Signature");

}
