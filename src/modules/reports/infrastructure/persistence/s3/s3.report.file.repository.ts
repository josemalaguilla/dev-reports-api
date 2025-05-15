import { S3Client } from '@aws-sdk/client-s3';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReportFileRepository } from 'src/modules/reports/domain/ports/report.file.repository';
import { S3FileRepository } from 'src/shared/file/infraestructure/s3/s3.file.repository';

export class S3ReportFileRepository
  extends S3FileRepository
  implements ReportFileRepository
{
  constructor(
    client: S3Client,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    super(client, configService.get<string>('REPORTS_S3_BUCKET'));
  }
}
