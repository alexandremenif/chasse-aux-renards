export class ApplicationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApplicationError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }
}
