import { INestApplication } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { DataSource } from 'typeorm';

export class TestStateReseter {
  public static async resetDatabase(app: INestApplication) {
    const datasource = app.get<DataSource>(DataSource);
    const entities = datasource.entityMetadatas;
    const promises = [];
    for (const entity of entities) {
      const repository = datasource.getRepository(entity.name);
      promises.push(repository.clear());
    }
    await Promise.all(promises);
  }

  public static async purgeQueues(app: INestApplication) {
    const sqsService = app.get<SqsService>(SqsService);
    const consumerNames = sqsService.consumers.keys();
    const promises = [];
    for (const consumerName of consumerNames) {
      promises.push(sqsService.purgeQueue(consumerName));
    }
    await Promise.all(promises);
  }
}
