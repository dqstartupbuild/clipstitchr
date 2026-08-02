import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export type PostValidationError = {
  /** Provider identifier, e.g. "instagram", "tiktok". */
  provider: string;
  /** Human readable provider name, e.g. "Instagram", "TikTok". */
  name: string;
  /** The readable validation error. */
  error: string;
};

export class PostValidationException extends HttpException {
  constructor(message: PostValidationError) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

@Catch(PostValidationException)
export class PostValidationExceptionFilter implements ExceptionFilter {
  catch(exception: PostValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const { provider, name, error } =
      exception.getResponse() as PostValidationError;

    response.status(status).json({
      statusCode: status,
      provider,
      name,
      message: error,
    });
  }
}
