import { SQSClient } from '@aws-sdk/client-sqs';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SNSEventBusFactory } from 'src/shared/events/infrastructure/sns/sns.event.bus.factory';
import { SNSTopic } from 'src/shared/events/infrastructure/sns/value-objects/sns.topic';
import { ReportTemplateModule } from '../report-templates/report-template.module';
import { CreateReportUseCase } from './application/use-cases/create-report.use-case';
import { DeleteReportUseCase } from './application/use-cases/delete-report.use-case';
import { DownloadReportUseCase } from './application/use-cases/download-report.use-case';
import { FindReportByIdUseCase } from './application/use-cases/find-report-by-id.use-case';
import { FindReportsUseCase } from './application/use-cases/find-reports.use-case';
import { GenerateReportUseCase } from './application/use-cases/generate-report.use-case';
import { ReportGenerateOnReportCreate } from './application/use-cases/report-generate-on-report-create.controller';
import { ReportsSQSConsumer } from './infrastructure/interface/events/controllers/sqs.reports.controller';
import { ReportsDeleteController } from './infrastructure/interface/rest/controllers/reports.delete.controller';
import { ReportsDownloadController } from './infrastructure/interface/rest/controllers/reports.download.controller';
import { ReportsGetController } from './infrastructure/interface/rest/controllers/reports.get.controller';
import { ReportsGetIdController } from './infrastructure/interface/rest/controllers/reports.get.id.controller';
import { ReportsPostController } from './infrastructure/interface/rest/controllers/reports.post.controller';
import { S3ReportFileRepository } from './infrastructure/persistence/s3/s3.report.file.repository';
import { TypeORMReportEntity } from './infrastructure/persistence/typeorm/entities/typeorm.report.entity';
import { TypeORMReportRepository } from './infrastructure/persistence/typeorm/repositories/typeorm.report.repository';
import { REPORT_SYMBOLS } from './reports.symbols';

const useCases = [
  {
    provide: REPORT_SYMBOLS.CREATE_REPORT_USE_CASE,
    useClass: CreateReportUseCase,
  },
  {
    provide: REPORT_SYMBOLS.FIND_REPORTS_USE_CASE,
    useClass: FindReportsUseCase,
  },
  {
    provide: REPORT_SYMBOLS.FIND_REPORT_BY_ID_USE_CASE,
    useClass: FindReportByIdUseCase,
  },
  {
    provide: REPORT_SYMBOLS.DELETE_REPORT_USE_CASE,
    useClass: DeleteReportUseCase,
  },
  {
    provide: REPORT_SYMBOLS.GENERATE_REPORT_USE_CASE,
    useClass: GenerateReportUseCase,
  },
  {
    provide: REPORT_SYMBOLS.GENERATE_REPORT_ON_REPORT_CREATE,
    useClass: ReportGenerateOnReportCreate,
  },
  {
    provide: REPORT_SYMBOLS.DOWNLOAD_REPORT_USE_CASE,
    useClass: DownloadReportUseCase,
  },
];

const repositories = [
  {
    provide: REPORT_SYMBOLS.REPORT_REPOSITORY,
    useClass: TypeORMReportRepository,
  },
  {
    provide: REPORT_SYMBOLS.REPORT_FILE_REPOSITORY,
    useClass: S3ReportFileRepository,
  },
];

const eventBus = [
  {
    provide: REPORT_SYMBOLS.REPORT_EVENT_BUS,
    useFactory: (
      eventBusFactory: SNSEventBusFactory,
      configService: ConfigService,
    ) => {
      const topic = new SNSTopic(
        configService.get<string>('REPORTS_EVENT_BUS_SNS_TOPIC'),
      );
      return eventBusFactory.create(topic);
    },
    inject: [SNSEventBusFactory, ConfigService],
  },
  ReportsSQSConsumer,
];

const externalInterfaces = [];

const sqsModule = SqsModule.registerAsync({
  useFactory: (configService: ConfigService, sqsClient: SQSClient) => {
    return {
      consumers: [
        {
          name: REPORT_SYMBOLS.REPORT_DOMAIN_EVENTS_MESSAGE,
          queueUrl: configService.get<string>(
            'REPORTS_EVENT_BUS_SQS_QUEUE_URL',
          ),
          region: configService.get<string>('AWS_REGION'),
          sqs: sqsClient,
          suppressFifoWarning: true,
        },
      ],
      producers: [],
    };
  },
  inject: [ConfigService, SQSClient],
});

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeORMReportEntity]),
    sqsModule,
    ReportTemplateModule,
  ],
  controllers: [
    ReportsPostController,
    ReportsGetController,
    ReportsGetIdController,
    ReportsDeleteController,
    ReportsDownloadController,
  ],
  providers: [...useCases, ...repositories, ...eventBus],
  exports: [...externalInterfaces],
})
export class ReportsModule {}
