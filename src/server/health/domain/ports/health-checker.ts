import { ApplicationHealth } from '../value-objects/application.health';
import { HealthIndicator } from './health-indicator';

export interface HealthChecker {
  check(indicators: HealthIndicator[]): Promise<ApplicationHealth>;
}
