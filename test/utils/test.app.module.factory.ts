import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AppModule,
  DatabaseModuleConfiguration,
} from '../../src/server/app.module';

export class AppTestModuleFactory {
  public createModule(): TestingModuleBuilder {
    return Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModuleConfiguration)
      .useModule(
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            username: configService.get<string>('DATABASE_USER'),
            password: configService.get<string>('DATABASE_PASSWORD'),
            database: configService.get<string>('DATABASE_NAME'),
            entities: [__dirname + '/../../**/*.entity.ts'],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
      );
  }
}
