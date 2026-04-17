import type { BoomerangGlobal, BoomerangRuntimeWindow, BoomrConfig } from './types';

export type BoomerangRuntimeState = 'idle' | 'ready' | 'initialized' | 'error';

export interface InitializeBoomerangOptions {
  config: BoomrConfig;
  onBeforeBeacon?: (vars: Record<string, unknown>) => void;
  onOnBeacon?: () => void;
  callPageReady?: boolean;
}

export class BoomerangRumManager {
  // Tracks boomerang runtime lifecycle to simplify service-level decisions.
  private state: BoomerangRuntimeState = 'idle';

  constructor(private readonly runtimeWindow: BoomerangRuntimeWindow = window) {}

  getState(): BoomerangRuntimeState {
    return this.state;
  }

  getBoomerang(): BoomerangGlobal | null {
    return this.runtimeWindow.BOOMR ?? null;
  }

  markReadyIfAvailable(): boolean {
    // Mark as ready only when the BOOMR global has been loaded on window.
    if (!this.runtimeWindow.BOOMR) {
      return false;
    }

    this.state = 'ready';
    return true;
  }

  initialize(options: InitializeBoomerangOptions): boolean {
    const boomerang = this.runtimeWindow.BOOMR;
    // Initialization cannot proceed until boomerang exposes its init API.
    if (!boomerang?.init) {
      this.state = 'error';
      return false;
    }

    boomerang.init(options.config);

    if (options.onBeforeBeacon) {
      boomerang.subscribe('before_beacon', (...args: unknown[]) => {
        options.onBeforeBeacon?.(args[0] as Record<string, unknown>);
      });
    }

    if (options.onOnBeacon) {
      boomerang.subscribe('onbeacon', options.onOnBeacon);
    }

    if (options.callPageReady ?? true) {
      // Trigger page_ready by default so initial navigation metrics are emitted.
      boomerang.page_ready();
    }

    this.state = 'initialized';
    return true;
  }
}
