import { S3Client } from '@aws-sdk/client-s3';
import { SNSClient } from '@aws-sdk/client-sns';
import { SQSClient } from '@aws-sdk/client-sqs';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AwsClientStub, mockClient } from 'aws-sdk-client-mock';
import {
  AppModule,
  DatabaseModuleConfiguration,
} from '../../src/server/app.module';
import { TypeORMTestMemoryDatabase } from './test.memory.database';

export class MockAppModuleFactory {
  public createModule(): TestingModuleBuilder {
    const sqsClient = mockClient(SQSClient) as AwsClientStub<SQSClient>;
    sqsClient.onAnyCommand().resolves({});
    return Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModuleConfiguration)
      .useModule(TypeORMTestMemoryDatabase)
      .overrideProvider(S3Client)
      .useValue(mockClient(S3Client))
      .overrideProvider(SNSClient)
      .useValue(mockClient(SNSClient))
      .overrideProvider(SQSClient)
      .useValue(sqsClient);
  }
}
