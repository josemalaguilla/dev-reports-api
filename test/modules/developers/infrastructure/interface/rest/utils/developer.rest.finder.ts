import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';

export class DeveloperRestFinder {
  constructor(private readonly app: NestExpressApplication) {}

  public async findById(id: string): Promise<request.Response> {
    return request(this.app.getHttpServer()).get(`/developers/${id}`);
  }
}
