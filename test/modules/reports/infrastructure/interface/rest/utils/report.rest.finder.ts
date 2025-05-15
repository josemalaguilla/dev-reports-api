import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';

export class ReportRestFinder {
  constructor(private readonly app: NestExpressApplication) {}

  async findById(id: string): Promise<request.Response> {
    return request(this.app.getHttpServer()).get(`/reports/${id}`);
  }

  async findAll(): Promise<request.Response> {
    return request(this.app.getHttpServer()).get('/reports');
  }

  async findWithFilter(where: any): Promise<request.Response> {
    return request(this.app.getHttpServer()).get('/reports').query({ where });
  }

  async findWithPagination(
    offset: number,
    limit: number,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .get('/reports')
      .query({ limit, offset });
  }
}
