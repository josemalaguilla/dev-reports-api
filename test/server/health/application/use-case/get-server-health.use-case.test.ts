import { ServiceUnavailableException } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { ApplicationHealthWithPrimitives } from 'src/server/health/domain/value-objects/application.health';
import { TypeORMHealthIndicator } from 'src/server/health/infrastructure/health-checker/indicators/typeorm.health.indicator';
import { TerminusHealthChecker } from 'src/server/health/infrastructure/health-checker/terminus.health.checker';
import { GetServerHealthUseCase } from '../../../../../src/server/health/application/use-case/get-server-health.use-case';

describe('GetServerHealthUseCase', () => {
  let healthCheckService: Partial<HealthCheckService>;
  let databaseIndicator: Partial<TypeOrmHealthIndicator>;
  let service: GetServerHealthUseCase;
  const validHealthStatus: ApplicationHealthWithPrimitives = {
    status: 'ok',
    details: { database: { status: 'up' } },
  };
  const invalidHealthStatus: ApplicationHealthWithPrimitives = {
    status: 'ok',
    details: { database: { status: 'up' } },
  };

  beforeEach(() => {
    healthCheckService = {
      check: jest.fn(),
    };
    databaseIndicator = {
      pingCheck: jest.fn(),
    };
    service = new GetServerHealthUseCase(
      new TerminusHealthChecker(healthCheckService as HealthCheckService),
      new TypeORMHealthIndicator(databaseIndicator as TypeOrmHealthIndicator),
    );
  });

  it('should return ok when health check service says it is ok', async () => {
    mockHealthServiceToReturnOk();

    const result = await service.run();

    expectToReturnHealthOKStatus(result);
  });

  it('should throw error when health check service says it is down', async () => {
    mockHealthServiceToReturnNok();

    try {
      await service.run();
    } catch (error) {
      expectToReturnServiceUnavailableError(error);
    }
  });

  function mockHealthServiceToReturnOk(): void {
    healthCheckService.check = jest.fn().mockResolvedValue(validHealthStatus);
  }

  function mockHealthServiceToReturnNok(): void {
    healthCheckService.check = jest
      .fn()
      .mockRejectedValue(new ServiceUnavailableException(invalidHealthStatus));
  }

  function expectToReturnHealthOKStatus(
    result: ApplicationHealthWithPrimitives,
  ): void {
    expect(result).toEqual(validHealthStatus);
  }

  function expectToReturnServiceUnavailableError(error: Error): void {
    expect(error).toBeInstanceOf(ServiceUnavailableException);
  }
});
