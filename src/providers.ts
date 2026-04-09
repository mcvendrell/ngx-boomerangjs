import { inject, makeEnvironmentProviders, provideAppInitializer, type EnvironmentProviders } from '@angular/core';
import { BoomerangMetricsService } from './boomerang-metrics.service';
import { BOOMERANG_CONFIG, type NgxBoomerangjsConfig } from './tokens';

export function provideBoomerangMetrics(config: NgxBoomerangjsConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: BOOMERANG_CONFIG,
      useValue: config,
    },
    provideAppInitializer(() => inject(BoomerangMetricsService).init()),
  ]);
}
