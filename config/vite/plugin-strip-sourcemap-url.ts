import type { Plugin } from 'vite';

// Matches a `//# sourceMappingURL=...` or `//@ sourceMappingURL=...` comment
// that sits on its own line. Anchored to the start of a line (with the `m`
// flag) so we never touch string literals, regex literals, or other code that
// happens to contain the substring `sourceMappingURL`.
const JS_SOURCE_MAPPING_URL = /^\/\/[#@]\s*sourceMappingURL=.*$/gm;

// CSS form: `/*# sourceMappingURL=... */` on its own line.
const CSS_SOURCE_MAPPING_URL = /^\/\*[#@]\s*sourceMappingURL=.*\*\/\s*$/gm;

/**
 * Strips `sourceMappingURL` comments from emitted JS and CSS assets.
 *
 * When `build.sourcemap` is `false`, Vite (via esbuild) already omits these
 * comments from code it bundles itself. But files imported as URL assets
 * (e.g. `import('foo?url')`) are copied to the output directory verbatim —
 * if the upstream package ships a pre-minified file with an embedded
 * `sourceMappingURL`, the comment leaks into the final bundle even though we
 * never ship the matching `.map` file. The browser then tries to fetch a map
 * that does not exist, producing a 404 in the DevTools network panel.
 *
 * This plugin walks the emitted bundle after it has been generated and
 * removes any stray `sourceMappingURL` comments from JS and CSS assets.
 */
export function MastodonStripSourceMappingURL(): Plugin {
  return {
    name: 'mastodon:strip-sourcemapping-url',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== 'asset') continue;
        if (!/\.(?:js|mjs|cjs|css)$/i.test(file.fileName)) continue;

        const wasString = typeof file.source === 'string';
        const original = wasString
          ? (file.source as string)
          : new TextDecoder().decode(file.source as Uint8Array);

        const stripped = original
          .replace(JS_SOURCE_MAPPING_URL, '')
          .replace(CSS_SOURCE_MAPPING_URL, '');

        if (stripped === original) continue;

        file.source = wasString
          ? stripped
          : new TextEncoder().encode(stripped);
      }
    },
  };
}
