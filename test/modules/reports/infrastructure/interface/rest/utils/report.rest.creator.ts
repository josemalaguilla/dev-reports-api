import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { ReportTargetIdMother } from 'test/modules/reports/domain/value-objects/report.target.id.mother';
import { ReportTargetMother } from 'test/modules/reports/domain/value-objects/report.target.mother';
import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { CreateReportRequest } from '../../../../../../../src/modules/reports/infrastructure/interface/rest/dtos/create.report.request';

export class ReportRestCreator {
  constructor(private readonly app: NestExpressApplication) {}

  async create(count = 1): Promise<
    Array<{
      body: CreateReportRequest;
      response: request.Response;
    }>
  > {
    const randomizer = RandomizerStore.get();
    const results = [];

    for (let i = 0; i < count; i++) {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - randomizer.integer(1, 30));

      const body: CreateReportRequest = {
        target: ReportTargetMother.random().value(),
        targetId: ReportTargetIdMother.random().value(),
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      };

      const response = await this.createWithBody(body);

      results.push({ body, response });
    }

    return results;
  }

  async createWithBody(body: CreateReportRequest): Promise<request.Response> {
    return await request(this.app.getHttpServer()).post('/reports').send(body);
  }
}
