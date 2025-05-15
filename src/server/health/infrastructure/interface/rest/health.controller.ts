import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';
import { GetServerHealthUseCase } from 'src/server/health/application/use-case/get-server-health.use-case';
import { ApplicationHealthWithPrimitives } from 'src/server/health/domain/value-objects/application.health';
import { HEALTH_SYMBOLS } from 'src/server/health/health.symbols';
import {
  HealthGETResponseErrorExamples,
  HealthGETResponseSuccessExamples,
} from './docs/health.rest.examples';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(HEALTH_SYMBOLS.GET_SERVER_HEALTH_USE_CASE)
    private readonly getServerHealthUseCase: GetServerHealthUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Checks server health' })
  @ApiResponse({
    status: 200,
    description: 'Server health check',
    example: HealthGETResponseSuccessExamples,
  })
  @ApiResponse({
    status: 503,
    description: 'Server is not healthy',
    example: HealthGETResponseErrorExamples,
  })
  @HealthCheck()
  getHealth(): Promise<ApplicationHealthWithPrimitives> {
    return this.getServerHealthUseCase.run();
  }
}
