import { inject, Injectable } from '@angular/core';
import { createDefaultBoomerangScripts } from './default-scripts';
import { BoomerangRumManager } from './manager';
import { loadScriptsInOrder } from './script-loader';
import { BOOMERANG_CONFIG } from './tokens';

/**
 * Service responsible for loading Boomerang scripts & initializing the BOOMR global.
 * We added some new capabilities to the standard BoomerangJS:
 * 1) Allowing users to specify a custom list of scripts to load, instead of the default bundle.
 *    This is useful for advanced users who want more control over which Boomerang plugins are included in their build.
 * 2) Attaching a source IP variable to every beacon, with the value resolved once at initialization.
 *    This is useful for users who want to include client IP information in their performance metrics without relying on server-side enrichment.
 *    If not provided, it defaults to 127.0.0.1.
 * 3) The service also includes a fix for missing t_resp values on XHR initiators (like Angular) by calculating it from the Performance API when possible,
 *    and falling back to t_done if necessary.
 */

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
    // Set immediately to prevent concurrent calls from entering the initialization path.
    this.initialized = true;

    // User can use custom scripts providing it in config.scripts; otherwise load the default boomerang bundle
    const scripts = this.config.scripts ?? createDefaultBoomerangScripts(this.config.scriptBaseUrl);

    await loadScriptsInOrder(scripts, {
      timeoutMs: this.config.scriptLoadTimeoutMs,
    });

    // Resolve source IP once. If sourceIpFactory is not provided, falls back to '127.0.0.1'.
    // If sourceIpVarName is not provided, defaults to 'source_ip'. The variable is always attached
    // to every beacon; omit both options only if you want the default placeholder value sent.
    const sourceIp = this.config.sourceIpFactory ? await this.config.sourceIpFactory().catch(() => '127.0.0.1') : '127.0.0.1';
    const sourceIpVarName = this.config.sourceIpVarName ?? 'source_ip';
    let addedManualTResp = false;

    // Attach source IP variable right before beacon send, and clean them up immediately after
    const initialized = this.manager.initialize({
      // The config passed from APP_INITIALIZER is expected to already include any necessary plugin configuration, so we can pass it directly
      config: this.config.boomerangConfig,

      // We add here our custom needs related to source IP and t_resp fixing
      onBeforeBeacon: (vars: Record<string, unknown>) => {
        // Attach source IP variable to every beacon with the resolved value.
        this.manager.getBoomerang()?.addVar(sourceIpVarName, sourceIp);
        addedManualTResp = false;

        // Fix missing t_resp for XHR initiators by calculating it from the Performance API when possible, and falling back to t_done if necessary.
        // The reason to do this is that Angular's HttpClient does not populate t_resp everytime, for various reasons (ask IA about t_resp and Angular).
        if (this.config.fixXhrTResp === true && vars['http.initiator'] === 'xhr' && vars['t_resp'] == null) {
          const url = typeof vars['u'] === 'string' ? vars['u'] : undefined;
          let tResp: number | undefined;

          if (url) {
            const entries = performance.getEntriesByName(url) as PerformanceResourceTiming[];
            const last = entries.at(-1);

            if (last && last.responseStart > 0) {
              tResp = Math.round(last.responseStart - last.requestStart);
            }
          }

          if (tResp == null && vars['t_done'] != null) {
            tResp = Math.round(Number(vars['t_done']));
          }

          if (tResp != null) {
            this.manager.getBoomerang()?.addVar('t_resp', tResp);
            addedManualTResp = true;
          }
        }
      },

      // Remove custom vars after beacon is sent to avoid leaking it to subsequent beacons
      onOnBeacon: () => {
        const boomerang = this.manager.getBoomerang();

        boomerang?.removeVar(sourceIpVarName);

        // t_resp only when we added it manually to fix missing values, to avoid removing legitimate t_resp values from other initiators
        if (addedManualTResp) {
          boomerang?.removeVar('t_resp');
          addedManualTResp = false;
        }
      },

      callPageReady: true,
    });

    if (!initialized) {
      throw new Error('[ngx-boomerangjs] BOOMR is unavailable after script load. Verify CSP/AdBlock constraints.');
    }
  }
}
