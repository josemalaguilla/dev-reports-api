export interface UseCase<Response, Args extends unknown[] = []> {
  run(...args: Args): Promise<Response> | Response;
}
