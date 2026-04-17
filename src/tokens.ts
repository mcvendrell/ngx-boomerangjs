import { InjectionToken } from '@angular/core';
import type { BoomrConfig, ScriptDescriptor } from './types';

export interface NgxBoomerangjsConfig {
  enabled: boolean;
  boomerangConfig: BoomrConfig;
  scripts?: ScriptDescriptor[];
  scriptBaseUrl?: string;
  scriptLoadTimeoutMs?: number;
  sourceIpVarName?: string;
  sourceIpFactory?: () => Promise<string>;
  fixXhrTResp?: boolean;
}

export const BOOMERANG_CONFIG = new InjectionToken<NgxBoomerangjsConfig>('BOOMERANG_CONFIG');
