// @flow

type HandlerType = (
  req: express$Request,
  res: express$Response,
  next: express$NextFunction
) => Promise<mixed>;

// Controls the amount of console output.
const inTest = process.env.NODE_ENV === 'test';

/**
 * This is an Express error handler.
 */
function errorHandler(next: express$NextFunction, error: Error): void {
  const msg = String(error.message ? error.message : error);
  logError(msg);
  next(new Error(msg)); // invokes builtin Express error handler
}

export function logError(msg: string): void {
  if (!inTest) console.error(msg);
}

export function throwIf(condition: boolean, message: string) {
  if (condition) throw new Error(message);
}

// This provides common error handling for REST services.
export function wrap(handler: HandlerType): HandlerType {
  return async (
    req: express$Request,
    res: express$Response,
    next: express$NextFunction
  ) => {
    try {
      let result = await handler(req, res, next);
      // Change numeric results to a string so
      // Express won't think it is an HTTP status code.
      if (typeof result === 'number') result = String(result);
      res.send(result);
    } catch (e) {
      errorHandler(next, e);
    }
  };
}
