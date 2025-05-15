export interface ServiceHealth {
  [serviceName: string]: {
    status: 'up' | 'down';
  };
}

export interface HealthIndicator {
  check(): Promise<ServiceHealth>;
}
