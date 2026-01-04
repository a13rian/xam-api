import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { RequestContext } from '@core/domain/logging/request-context.js';

@Injectable()
export class RequestContextStorage {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }

  getRequestId(): string | undefined {
    return this.getContext()?.requestId;
  }

  getCorrelationId(): string | undefined {
    return this.getContext()?.correlationId;
  }

  getUserId(): string | undefined {
    return this.getContext()?.userId;
  }
}
