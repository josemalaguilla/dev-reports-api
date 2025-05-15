import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SNSEventBusFactory } from 'src/shared/events/infrastructure/sns/sns.event.bus.factory';
import { SNSTopic } from 'src/shared/events/infrastructure/sns/value-objects/sns.topic';
import { CreateDeveloperUseCase } from './application/use-cases/create-developer.use-case';
import { DeleteDeveloperUseCase } from './application/use-cases/delete-developer.use-case';
import { FindDevelopersUseCase } from './application/use-cases/find-developers.use-case';
import { FindOneDeveloperUseCase } from './application/use-cases/find-one-developer.use-case';
import { UpdateDeveloperUseCase } from './application/use-cases/update-developer.use-case';
import { DEVELOPER_SYMBOLS } from './developers.symbols';
import { DevelopersDeleteController } from './infrastructure/interface/rest/controllers/developers.delete.controller';
import { DevelopersGetController } from './infrastructure/interface/rest/controllers/developers.get.controller';
import { DevelopersGetIdController } from './infrastructure/interface/rest/controllers/developers.get.id.controller';
import { DevelopersPatchController } from './infrastructure/interface/rest/controllers/developers.patch.controller';
import { DevelopersPostController } from './infrastructure/interface/rest/controllers/developers.post.controller';
import { TypeORMDeveloperEntity } from './infrastructure/persistence/typeorm/entities/typeorm.developer.entity';
import { TypeORMDeveloperRepository } from './infrastructure/persistence/typeorm/repositories/typeorm.developer.repository';

const useCases = [
  {
    provide: DEVELOPER_SYMBOLS.CREATE_DEVELOPER_USE_CASE,
    useClass: CreateDeveloperUseCase,
  },
  {
    provide: DEVELOPER_SYMBOLS.FIND_DEVELOPERS_USE_CASE,
    useClass: FindDevelopersUseCase,
  },
  {
    provide: DEVELOPER_SYMBOLS.FIND_ONE_DEVELOPER_USE_CASE,
    useClass: FindOneDeveloperUseCase,
  },
  {
    provide: DEVELOPER_SYMBOLS.UPDATE_DEVELOPER_USE_CASE,
    useClass: UpdateDeveloperUseCase,
  },
  {
    provide: DEVELOPER_SYMBOLS.DELETE_DEVELOPER_USE_CASE,
    useClass: DeleteDeveloperUseCase,
  },
];

const repositories = [
  {
    provide: DEVELOPER_SYMBOLS.DEVELOPER_REPOSITORY,
    useClass: TypeORMDeveloperRepository,
  },
];

const eventBus = [
  {
    provide: DEVELOPER_SYMBOLS.DEVELOPER_EVENT_BUS,
    useFactory: (
      eventBusFactory: SNSEventBusFactory,
      configService: ConfigService,
    ) => {
      const topic = new SNSTopic(
        configService.get<string>('DEVELOPERS_EVENT_BUS_SNS_TOPIC'),
      );
      return eventBusFactory.create(topic);
    },
    inject: [SNSEventBusFactory, ConfigService],
  },
];

const externalInterfaces = [DEVELOPER_SYMBOLS.FIND_ONE_DEVELOPER_USE_CASE];

@Module({
  imports: [TypeOrmModule.forFeature([TypeORMDeveloperEntity])],
  controllers: [
    DevelopersPostController,
    DevelopersPatchController,
    DevelopersGetIdController,
    DevelopersGetController,
    DevelopersDeleteController,
  ],
  providers: [...useCases, ...repositories, ...eventBus],
  exports: [...externalInterfaces],
})
export class DevelopersModule {}
