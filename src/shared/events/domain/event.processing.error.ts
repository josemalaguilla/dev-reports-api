export class EventProcessingError {
  constructor(
    public readonly subscriber: string,
    public readonly error: Error,
  ) {}

  public get message(): string {
    return this.error.message;
  }
}
