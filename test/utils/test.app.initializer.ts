import { NestExpressApplication } from '@nestjs/platform-express';
import { TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppConfig } from '../../src/server/config';
import { ConsumersHandler } from './consumers.handler';

declare interface ModuleFactory {
  createModule(): TestingModuleBuilder;
}

export class TestAppInitializer {
  constructor(private readonly moduleFactory: ModuleFactory) {}

  /**
   * Creates the nest app to be used for the test instance. We do not share the same singleton app instance because of
   * jest test native isolation and multiple workers execution.
   * @returns {NestExpressApplication} the application to use for the test case
   */
  public async getApp(): Promise<NestExpressApplication> {
    const testingModule: TestingModule = await this.moduleFactory
      .createModule()
      .compile();
    const app = testingModule.createNestApplication<NestExpressApplication>();
    this.enableNestedQueryParams(app);
    AppConfig.initialize(app);
    await app.init();
    const consumerHandler = new ConsumersHandler(app);
    consumerHandler.stopAllConsumers();
    const datasource = app.get<DataSource>(DataSource);
    await datasource.synchronize(true);
    return app;
  }

  /**
   * This setups the extended query parser to tell express that must parse nested query params
   * to allow objects in query be parsed as where[field]=value apart from stringified json query params.
   * @param app App which should be modified
   */
  private enableNestedQueryParams(app: NestExpressApplication): void {
    app.set('query parser', 'extended');
  }
}
