import { inject, Injectable } from '@angular/core';
import { createDefaultBoomerangScripts } from './default-scripts';
import { BoomerangRumManager } from './manager';
import { loadScriptsInOrder } from './script-loader';
import { BOOMERANG_CONFIG } from './tokens';

@Injectable({ providedIn: 'root' })
export class BoomerangMetricsService {
  private readonly config = inject(BOOMERANG_CONFIG);
  
  private readonly manager = new BoomerangRumManager();
  private initialized = false;

  async init(): Promise<void> {
    // Avoid duplicate setup and allow feature-level disablement
    if (!this.config.enabled || this.initialized) {
      return;
    }

    // User can use custom scripts providing it in config.scripts; otherwise load the default boomerang bundle
    const scripts = this.config.scripts ?? createDefaultBoomerangScripts(this.config.scriptBaseUrl);

    await loadScriptsInOrder(scripts, {
      timeoutMs: this.config.scriptLoadTimeoutMs,
    });

    // Resolve source IP once and keep a safe fallback for environments where lookup fails.
    // User can also choose to disable this feature by omitting sourceIpFactory and sourceIpVarName from config,
    // in which case the default IP will be used without any lookup attempt.
    const sourceIp = this.config.sourceIpFactory ? await this.config.sourceIpFactory().catch(() => '127.0.0.1') : '127.0.0.1';
    const sourceIpVarName = this.config.sourceIpVarName ?? 'source_ip';

    // Attach source IP variable right before beacon send, and clean them up immediately after
    const initialized = this.manager.initialize({
      config: this.config.boomerangConfig,
      onBeforeBeacon: () => {
        this.manager.getBoomerang()?.addVar(sourceIpVarName, sourceIp);
      },
      onOnBeacon: () => {
        this.manager.getBoomerang()?.removeVar(sourceIpVarName);
      },
      callPageReady: true,
    });

    if (!initialized) {
      throw new Error('[ngx-boomerangjs] BOOMR is unavailable after script load. Verify CSP/AdBlock constraints.');
    }

    this.initialized = true;
  }
}
