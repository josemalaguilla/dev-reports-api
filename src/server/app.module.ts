import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import 'reflect-metadata';
import { ReportsModule } from 'src/modules/reports/reports.module';
import { SQSEventModule } from 'src/shared/events/infrastructure/sqs/sqs.event.module';
import { S3FileModule } from 'src/shared/file/infraestructure/s3/s3.file.module';
import { DevelopersModule } from '../modules/developers/developers.module';
import { SNSEventModule } from '../shared/events/infrastructure/sns/sns.event.module';
import { HealthModule } from './health/health.module';

export const DatabaseModuleConfiguration = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
    entities: [__dirname + '/../**/*.entity.js'],
    synchronize: true,
  }),
  inject: [ConfigService],
});

const ApplicationConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validationSchema: Joi.object({
    PORT: Joi.number().default(3000),
    LOG_LEVEL: Joi.string().default('warn'),
    LOGGED_CONTEXTS: Joi.string().default('*'),
    DATABASE_HOST: Joi.string().required(),
    DATABASE_PORT: Joi.number().default(3306),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    AWS_ENDPOINT: Joi.string().required(),
    AWS_REGION: Joi.string().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_KEY: Joi.string().required(),
    DEVELOPERS_EVENT_BUS_SNS_TOPIC: Joi.string().required(),
    DEVELOPERS_EVENT_BUS_SQS_QUEUE_URL: Joi.string().required(),
    REPORTS_EVENT_BUS_SNS_TOPIC: Joi.string().required(),
    REPORTS_EVENT_BUS_SQS_QUEUE_URL: Joi.string().required(),
    REPORTS_S3_BUCKET: Joi.string().required(),
  }),
});

@Module({
  imports: [
    ApplicationConfigModule,
    DatabaseModuleConfiguration,
    SNSEventModule,
    SQSEventModule,
    S3FileModule,
    HealthModule,
    DevelopersModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
