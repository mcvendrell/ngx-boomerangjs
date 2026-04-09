# ngx-boomerangjs

An Angular 21+ wrapper for [boomerangjs](https://github.com/nicjansma/boomerangjs) that provides automatic script loading and Real User Monitoring (RUM) support via Angular's dependency injection system.

## Features

- Automatic boomerang script loading with ordered sequence support
- Angular signal-based service for RUM metrics
- `APP_INITIALIZER` integration for zero-boilerplate setup
- Full TypeScript types for boomerang configuration
- SPA-friendly with History and SPA plugin support
- Configurable timeout and script integrity (SRI)

## Requirements

| Package           | Version    |
| ----------------- | ---------- |
| `@angular/core`   | `^21.0.0`  |
| `@angular/common` | `^21.0.0`  |
| `boomerangjs`     | `^1.815.1` |

## Installation

As ngx-boomerangjs has a peer dependency on boomerangjs, you need to install both packages:

```bash
npm install ngx-boomerangjs boomerangjs
```

## Quick Start

### 1. Provide the configuration in `app.config.ts`

Minimal example with boomerang core config:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideBoomerangMetrics } from 'ngx-boomerangjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBoomerangMetrics({
      enabled: true,
      boomerangConfig: {
        beacon_url: 'https://your-beacon-endpoint.example.com/beacon',
        Errors: { enabled: true, sendInterval: 1000, maxErrors: 20 },
        History: { enabled: true },
      },
    }),
  ],
};
```

Extended configuration example with custom script source, timeout, and source IP variable:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideBoomerangMetrics } from 'ngx-boomerangjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBoomerangMetrics({
      enabled: true,
      boomerangConfig: {
        beacon_url: 'https://your-beacon-endpoint.example.com/beacon',
        Errors: { enabled: true, sendInterval: 1000, maxErrors: 20 },
        History: { enabled: true },
      },
      scriptBaseUrl: '/assets/boomerang',
      scriptLoadTimeoutMs: 15000,
      sourceIpVarName: 'my_ip',
      sourceIpFactory: async () => {
        const ipService = inject(IpService);
        const result = await firstValueFrom(ipService.getIpAddress());
        return result.clientHost;
      },
    }),
  ],
};
```

### Set the needed assets for boomerangjs

In `angular.json`, in `projects.<app>.architect.build.options.assets`, add the following entries to map the boomerang core and plugin scripts from `node_modules` to your `assets` folder during build:

```json
{
  "glob": "boomerang.js",
  "input": "node_modules/boomerangjs/",
  "output": "assets/boomerang/"
},
{
  "glob": "rt.js",
  "input": "node_modules/boomerangjs/plugins/",
  "output": "assets/boomerang/plugins/"
},
{
  "glob": "auto-xhr.js",
  "input": "node_modules/boomerangjs/plugins/",
  "output": "assets/boomerang/plugins/"
},
{
  "glob": "errors.js",
  "input": "node_modules/boomerangjs/plugins/",
  "output": "assets/boomerang/plugins/"
},
{
  "glob": "memory.js",
  "input": "node_modules/boomerangjs/plugins/",
  "output": "assets/boomerang/plugins/"
},
{
  "glob": "painttiming.js",
  "input": "node_modules/boomerangjs/plugins/",
  "output": "assets/boomerang/plugins/"
},
{
  "glob": "navtiming.js",
  "input": "node_modules/boomerangjs/plugins/",
  "output": "assets/boomerang/plugins/"
},
{
  "glob": "zzz-last-plugin.js",
  "input": "node_modules/boomerangjs/plugins/",
  "output": "assets/boomerang/plugins/"
}
```

## API

### `provideBoomerangMetrics(config: NgxBoomerangjsConfig)`

Registers boomerang as an Angular environment provider. Runs script loading and initialization during `APP_INITIALIZER`.

### `NgxBoomerangjsConfig`

```ts
export interface NgxBoomerangjsConfig {
  enabled: boolean;
  boomerangConfig: BoomrConfig;
  scripts?: ScriptDescriptor[];
  scriptBaseUrl?: string;
  scriptLoadTimeoutMs?: number;
  sourceIpVarName?: string;
  sourceIpFactory?: () => Promise<string>;
}
```

| Property              | Type                    | Description                                                                                 |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| `enabled`             | `boolean`               | Enables or disables boomerang initialization.                                               |
| `boomerangConfig`     | `BoomrConfig`           | Boomerang `BOOMR.init()` configuration.                                                     |
| `scripts`             | `ScriptDescriptor[]`    | Optional ordered script list. If omitted, defaults are created from `scriptBaseUrl`.        |
| `scriptBaseUrl`       | `string`                | Optional Base URL used by `createDefaultBoomerangScripts()` when `scripts` is not provided. |
| `scriptLoadTimeoutMs` | `number`                | Optional Timeout in milliseconds for each script load.                                      |
| `sourceIpVarName`     | `string`                | Optional beacon variable name used to store source IP.                                      |
| `sourceIpFactory`     | `() => Promise<string>` | Optional async function that resolves the source IP value.                                  |

### `createDefaultBoomerangScripts(options)`

Helper to build a `ScriptDescriptor[]` list for the boomerang core and common plugins. With this option, you can replace the default script loading behavior with your own custom script list while still benefiting from the `scriptBaseUrl` and `scriptLoadTimeoutMs` configuration options.

## Configuration Reference

The `boomerangConfig` property maps directly to boomerang's `BOOMR.init()` options. See the [boomerangjs documentation](https://nicj.net/boomerangjs/) for the full list of supported plugins and settings.

## Contributing

Contributions are welcome, and pull requests are encouraged.

If you want to propose a fix, improvement, or new feature, feel free to open an issue for discussion or submit a PR directly.

## Development notes

### Building the library

This library is packaged using [ng-packagr](https://github.com/ng-packagr/ng-packagr) in **Angular Ivy partial compilation mode**, which is the standard format for distributing Angular libraries on npm.

Partial compilation produces output that Angular's linker processes at the application build time, making it compatible with AOT and enabling tree-shaking.

The build is driven by two config files:

- `ng-package.json` — tells ng-packagr where the entry point is (`src/public-api.ts`) and where to write the output (`dist/`).
- `tsconfig.lib.json` — extends the base `tsconfig.json` and sets `"compilationMode": "partial"` under `angularCompilerOptions`.

To build the library:

```bash
npm run build
```

The output in `dist/` follows the Angular Package Format (APF):

- `fesm2022/ngx-boomerangjs.mjs` — flat ES module bundle.
- `types/ngx-boomerangjs.d.ts` — consolidated type declarations.
- `package.json` — generated manifest with correct `exports`, `module`, and `typings` fields.

### Testing locally before publishing

To install the library in another project without publishing to npm, pack it as a tarball:

```bash
npm run build
npm run pack:local
```

This generates `ngx-boomerangjs-1.0.0.tgz` in the root. Install it in the consuming project:

```bash
npm install ../ngx-boomerangjs/ngx-boomerangjs-1.0.0.tgz
# or with pnpm:
pnpm add ../ngx-boomerangjs/ngx-boomerangjs-1.0.0.tgz
```

> Note: after any source change, rebuild and repack before reinstalling in the consumer project.

### Publishing to npm

Authentication uses a project-scoped `.npmrc` with an `NPM_TOKEN` environment variable. Set the token before publishing.

.npmrc file content should be:

```
registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

Then run the publish script:

```bash
set NPM_TOKEN=your_token_here # Windows
export NPM_TOKEN=your_token_here # Unix

npm run publish:dist
```

The `publish:dist` script runs `npm publish ./dist`, so only the compiled output is uploaded — source files are never included.

## License

MIT © 2026
