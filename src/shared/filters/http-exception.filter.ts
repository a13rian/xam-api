import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import {
  DomainException,
  ValidationException,
} from '../exceptions/domain.exception';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(HttpExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request.url);

    // Only log server errors (5xx), skip client errors (4xx)
    if (errorResponse.statusCode >= 500) {
      const errorMessage =
        exception instanceof Error ? exception.message : String(exception);
      this.logger.error(
        {
          method: request.method,
          url: request.url,
          statusCode: errorResponse.statusCode,
          errorName: exception instanceof Error ? exception.name : 'Unknown',
          errorMessage,
          stack: exception instanceof Error ? exception.stack : undefined,
        },
        `${request.method} ${request.url} - ${errorResponse.statusCode} - ${errorMessage}`,
      );
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, path: string): ErrorResponse {
    const timestamp = new Date().toISOString();

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return {
        statusCode: status,
        message: this.extractMessage(exceptionResponse),
        error: HttpStatus[status] || 'Error',
        timestamp,
        path,
      };
    }

    // Handle Domain ValidationException
    if (exception instanceof ValidationException) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        error: 'Validation Error',
        code: exception.code,
        errors: exception.errors,
        timestamp,
        path,
      };
    }

    // Handle other Domain Exceptions
    if (exception instanceof DomainException) {
      const statusCode = this.mapDomainExceptionToStatus(exception.code);
      return {
        statusCode,
        message: exception.message,
        error: exception.code,
        code: exception.code,
        timestamp,
        path,
      };
    }

    // Handle unknown exceptions
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp,
      path,
    };
  }

  private extractMessage(response: string | object): string {
    if (typeof response === 'string') {
      return response;
    }
    if (typeof response === 'object' && 'message' in response) {
      const message = (response as { message: string | string[] }).message;
      return Array.isArray(message) ? message.join(', ') : message;
    }
    return 'An error occurred';
  }

  private mapDomainExceptionToStatus(code: string): HttpStatus {
    const statusMap: Record<string, HttpStatus> = {
      ENTITY_NOT_FOUND: HttpStatus.NOT_FOUND,
      ENTITY_ALREADY_EXISTS: HttpStatus.CONFLICT,
      INVALID_OPERATION: HttpStatus.BAD_REQUEST,
      VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
      UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
      FORBIDDEN: HttpStatus.FORBIDDEN,
      INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
      ACCOUNT_LOCKED: HttpStatus.FORBIDDEN,
      EMAIL_NOT_VERIFIED: HttpStatus.FORBIDDEN,
      TOKEN_EXPIRED: HttpStatus.UNAUTHORIZED,
      INVALID_TOKEN: HttpStatus.UNAUTHORIZED,
    };
    return statusMap[code] || HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
