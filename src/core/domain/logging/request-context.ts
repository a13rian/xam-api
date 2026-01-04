export interface RequestContextData {
  requestId: string;
  correlationId: string;
  userId?: string;
  userEmail?: string;
  method?: string;
  path?: string;
  startTime: number;
}

export class RequestContext {
  private constructor(private readonly data: RequestContextData) {}

  static create(data: RequestContextData): RequestContext {
    return new RequestContext(data);
  }

  get requestId(): string {
    return this.data.requestId;
  }

  get correlationId(): string {
    return this.data.correlationId;
  }

  get userId(): string | undefined {
    return this.data.userId;
  }

  get userEmail(): string | undefined {
    return this.data.userEmail;
  }

  get method(): string | undefined {
    return this.data.method;
  }

  get path(): string | undefined {
    return this.data.path;
  }

  get startTime(): number {
    return this.data.startTime;
  }

  setUser(userId: string, userEmail?: string): void {
    this.data.userId = userId;
    this.data.userEmail = userEmail;
  }

  toLogObject(): Record<string, unknown> {
    return {
      requestId: this.data.requestId,
      correlationId: this.data.correlationId,
      ...(this.data.userId && { userId: this.data.userId }),
    };
  }
}
