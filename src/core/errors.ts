export class LumaError extends Error {
  readonly status: number;
  readonly body?: unknown;
  
  constructor(status: number, message: string,  body?: unknown) {
    super(message);
    this.name   = "LumaError";
    this.status = status;
    this.body   = body; 
  }
}

export class AuthenticationError extends LumaError {
  constructor(message: string, body?: unknown) {
    super(401, message, body);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends LumaError {
  constructor(message: string, body?: unknown) {
    super(400, message, body);

    this.name = "ValidationError";
  }
}

export class RateLimitError extends LumaError {
  constructor(message: string, body?: unknown) {
    super(429, message, body); 
    this.name = "RateLimitError";
  }
}

export const createError = (status: number, message: string, body?: unknown): LumaError => {
  switch (status) {
    case 400:
      return new ValidationError(message, body);
    case 401:
      return new AuthenticationError(message, body); 
    case 429:
      return new RateLimitError(message, body);
    default:
      return new LumaError(status, message, body);
  }
}
