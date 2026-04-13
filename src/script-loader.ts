import type { LoadScriptsOptions, ScriptDescriptor } from './types';

const DEFAULT_TIMEOUT_MS = 5_000;
const DEFAULT_SCRIPT_ATTRIBUTE = 'data-boomerang-script';

function existingScript(selector: string): HTMLScriptElement | null {
  return document.querySelector<HTMLScriptElement>(selector);
}

function appendScript(script: ScriptDescriptor, scriptAttribute: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    // Keep sync execution order so plugin dependencies are evaluated in sequence.
    el.src = script.src;
    el.async = false;
    el.defer = false;
    el.setAttribute(scriptAttribute, 'true');

    if (script.integrity) {
      el.integrity = script.integrity;
      el.crossOrigin = script.crossOrigin ?? 'anonymous';
    }

    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`[ngx-boomerangjs] Failed to load script: ${script.src}`));

    document.head.appendChild(el);
  });
}

export async function loadScriptsInOrder(scripts: ScriptDescriptor[], options?: LoadScriptsOptions): Promise<void> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const scriptAttribute = options?.scriptAttribute ?? DEFAULT_SCRIPT_ATTRIBUTE;

  for (const script of scripts) {
    // Skip script injection when the same source already exists in the document.
    const selector = `script[src="${script.src}"]`;
    if (existingScript(selector)) {
      continue;
    }

    // Race the load promise against a timeout to avoid hanging forever on blocked networks.
    await new Promise<void>((resolve, reject) => {
      const timerId = window.setTimeout(() => {
        reject(new Error(`[ngx-boomerangjs] Timeout loading script: ${script.src}`));
      }, timeoutMs);

      appendScript(script, scriptAttribute).then(
        () => { window.clearTimeout(timerId); resolve(); },
        (err: unknown) => { window.clearTimeout(timerId); reject(err instanceof Error ? err : new Error(String(err))); },
      );
    });
  }
}
