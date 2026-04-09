export interface BoomrAutoXhrConfig {
  enabled?: boolean;
  monitorFetch?: boolean;
  alwaysSendXhr?: boolean;
  xhrRequireChanges?: boolean;
}

export interface BoomrErrorsConfig {
  enabled?: boolean;
  monitorRejections?: boolean;
  monitorConsole?: boolean;
  sendAfterOnload?: boolean;
  sendInterval?: number;
  maxErrors?: number;
}

export interface BoomrSpaConfig {
  enabled?: boolean;
  singlePageApp?: boolean;
}

export interface BoomrHistoryConfig {
  enabled?: boolean;
}

export interface BoomrConfig {
  beacon_url: string;
  beacon_type?: 'GET' | 'POST' | 'AUTO';
  autorun?: boolean;
  log?: ((msg: unknown, level: string, source: string) => void) | null;
  instrument_xhr?: boolean;
  ResourceTiming?: { enabled?: boolean; clearOnBeacon?: boolean };
  NavigationTiming?: Record<string, unknown>;
  PaintTiming?: Record<string, unknown>;
  Memory?: Record<string, unknown>;
  AutoXHR?: BoomrAutoXhrConfig;
  Errors?: BoomrErrorsConfig;
  SPA?: BoomrSpaConfig;
  History?: BoomrHistoryConfig;
  [key: string]: unknown;
}

export interface BoomerangGlobal {
  t_end: number;
  debug: (...args: unknown[]) => void;
  init(config: BoomrConfig): BoomerangGlobal;
  page_ready(): void;
  subscribe(event: string, callback: (...args: unknown[]) => void): BoomerangGlobal;
  addVar(name: string, value: unknown): BoomerangGlobal;
  removeVar(...names: string[]): BoomerangGlobal;
  sendBeacon(): void;
}

export interface ScriptDescriptor {
  src: string;
  integrity?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

export interface LoadScriptsOptions {
  timeoutMs?: number;
  scriptAttribute?: string;
}

export type BoomerangRuntimeWindow = Window & {
  BOOMR?: BoomerangGlobal;
};
