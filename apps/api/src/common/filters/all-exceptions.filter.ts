import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Global exception filter: converts every uncaught error into the standard
// { success: false, statusCode, message, path, timestamp } shape
// (code-standards.md § 4) so no raw stack trace ever leaves the API.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // STEP 1: Determine the HTTP status — HttpExceptions carry their own,
    //         anything else is treated as an unexpected 500.
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      // STEP 2: Normalize the message — NestJS embeds it inside an object
      //         for some exceptions (including validation error arrays).
      message = typeof body === 'string' ? body : String((body as Record<string, unknown>).message ?? body);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // STEP 3: Always log the real error server-side — the client only ever
    //         sees the standardized shape above.
    if (status >= 500) {
      console.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}