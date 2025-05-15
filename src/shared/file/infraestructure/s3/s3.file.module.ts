import { S3Client } from '@aws-sdk/client-s3';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: (configService: ConfigService) => {
        return new S3Client({
          endpoint: configService.get<string>('AWS_ENDPOINT'),
          region: configService.get<string>('AWS_REGION'),
          credentials: {
            accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get<string>('AWS_SECRET_KEY'),
          },
          forcePathStyle: true,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [S3Client],
})
export class S3FileModule {}
