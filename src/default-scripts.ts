import type { ScriptDescriptor } from './types';

// Very IMPORTANT: don't use / at start of baseUrl since the script paths are relative to index.html page.
const DEFAULT_BASE = 'assets/boomerang';

// These are the original boomerang scripts, but without integrity or crossOrigin attributes since those can vary based on hosting and build setup.
// Users can customize the script list by providing their own in the config if needed.
export function createDefaultBoomerangScripts(baseUrl = DEFAULT_BASE): ScriptDescriptor[] {
  return [
    { src: `${baseUrl}/boomerang.js` },
    { src: `${baseUrl}/plugins/rt.js` },
    { src: `${baseUrl}/plugins/auto-xhr.js` },
    { src: `${baseUrl}/plugins/errors.js` },
    { src: `${baseUrl}/plugins/memory.js` },
    { src: `${baseUrl}/plugins/painttiming.js` },
    { src: `${baseUrl}/plugins/navtiming.js` },
    { src: `${baseUrl}/plugins/zzz-last-plugin.js` },
  ];
}
