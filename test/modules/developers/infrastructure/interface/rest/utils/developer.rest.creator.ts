import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { CreateDeveloperRequest } from '../../../../../../../src/modules/developers/infrastructure/interface/rest/dtos/create.developer.request';

declare type GenerationResult = {
  response: request.Response;
  body: CreateDeveloperRequest;
};

export class DeveloperRestCreator {
  constructor(private readonly app: NestExpressApplication) {}

  public async create(numberOfDevelopers: number): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];
    for (let index = 0; index < numberOfDevelopers; index++) {
      const body = this.getDeveloperRequest();
      results.push({
        body,
        response: await request(this.app.getHttpServer())
          .post('/developers')
          .send(body),
      });
    }
    return results;
  }

  private getDeveloperRequest(): CreateDeveloperRequest {
    const randomizer = RandomizerStore.get();
    return {
      name: randomizer.firstName(),
      lastName: randomizer.lastName(),
      email: randomizer.email(),
    };
  }
}
