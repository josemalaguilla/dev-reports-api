import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { GetServerHealthUseCase } from './application/use-case/get-server-health.use-case';
import { HEALTH_SYMBOLS } from './health.symbols';
import { TypeORMHealthIndicator } from './infrastructure/health-checker/indicators/typeorm.health.indicator';
import { TerminusHealthChecker } from './infrastructure/health-checker/terminus.health.checker';
import { HealthController } from './infrastructure/interface/rest/health.controller';
const useCases = [
  {
    provide: HEALTH_SYMBOLS.GET_SERVER_HEALTH_USE_CASE,
    useClass: GetServerHealthUseCase,
  },
];

const healthIndicators = [
  {
    provide: HEALTH_SYMBOLS.HEALTH_CHECKER,
    useClass: TerminusHealthChecker,
  },
  {
    provide: HEALTH_SYMBOLS.MAIN_DATABASE_HEALTH_INDICATOR,
    useClass: TypeORMHealthIndicator,
  },
];

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [...useCases, ...healthIndicators],
})
export class HealthModule {}
