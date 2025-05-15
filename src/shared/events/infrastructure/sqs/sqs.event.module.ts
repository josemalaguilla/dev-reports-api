import { SQSClient } from '@aws-sdk/client-sqs';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: SQSClient,
      useFactory: (configService: ConfigService) => {
        return new SQSClient({
          endpoint: configService.get<string>('AWS_ENDPOINT'),
          region: configService.get<string>('AWS_REGION'),
          credentials: {
            accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get<string>('AWS_SECRET_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [SQSClient],
})
export class SQSEventModule {}
