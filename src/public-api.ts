// Angular provider & service
export { BoomerangMetricsService } from './boomerang-metrics.service';
export { createDefaultBoomerangScripts } from './default-scripts';
export { provideBoomerangMetrics } from './providers';
export { BOOMERANG_CONFIG } from './tokens';
export type { NgxBoomerangjsConfig } from './tokens';

// Core types — useful for advanced usage and custom script config
export { BoomerangRumManager } from './manager';
export type { BoomerangRuntimeState, InitializeBoomerangOptions } from './manager';
export { loadScriptsInOrder } from './script-loader';
export type {
  BoomerangGlobal, BoomerangRuntimeWindow, BoomrAutoXhrConfig, BoomrConfig, BoomrErrorsConfig, BoomrHistoryConfig, BoomrSpaConfig, LoadScriptsOptions, ScriptDescriptor
} from './types';

