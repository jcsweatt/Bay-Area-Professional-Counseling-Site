import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repository = process.cwd();
const siteOrigin = 'https://bapc-redesign-previews.jcsweatt.chatgpt.site';
const destination = mkdtempSync(path.join(os.tmpdir(), 'bapc-jekyll-'));
const urlConfig = `${destination}.yml`;

try {
  writeFileSync(urlConfig, `url: "${siteOrigin}"
baseurl: ""
exclude:
  - public/assets
  - app
  - content
  - dist
  - node_modules
  - scripts
  - .openai
  - .next
  - .vinext
  - .wrangler
  - .pnpm-store
  - README.md
  - package.json
  - pnpm-lock.yaml
  - vite.config.ts
  - tsconfig.json
  - next-env.d.ts
  - .oxfmtrc.json
  - .oxlintrc.json
  - tools
  - google856eaa8101249a05.html
  - robots.txt
  - sitemap.xml
`);
  execFileSync('jekyll', ['build', '--config', `${path.join(repository, '_config.yml')},${urlConfig}`, '--destination', destination], {
    cwd: repository,
    stdio: 'inherit',
  });

  const registry = {};
  for (const file of htmlFiles(destination)) {
    const relative = path.relative(destination, file).split(path.sep).join('/');
    if (
      relative.startsWith('assets/') ||
      relative.startsWith('public/assets/') ||
      relative === 'google856eaa8101249a05.html' ||
      relative === 'marketing-mockups/brand-suite.html'
    ) continue;
    const source = readFileSync(file, 'utf8');
    const head = source.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
    const bodyMatch = source.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) continue;

    const route = relative === 'index.html'
      ? '/'
      : relative.endsWith('/index.html')
        ? `/${relative.slice(0, -'index.html'.length)}`
        : `/${relative}`;
    const bodyClass = bodyMatch[1].match(/\bclass=["']([^"']*)["']/i)?.[1] ?? '';
    const styles = [...head.matchAll(/<link\b([^>]*\brel=["']stylesheet["'][^>]*)>/gi)]
      .map((match) => attr(match[1], 'href'))
      .filter(Boolean)
      .map(normalizeUrl);
    const scripts = [...head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((match) => scriptRecord(match[1], match[2]));
    const bodySegments = [];
    const body = bodyMatch[2];
    const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let cursor = 0;
    for (const match of body.matchAll(scriptPattern)) {
      const start = match.index ?? 0;
      const preceding = normalizeMarkup(body.slice(cursor, start));
      if (preceding) bodySegments.push({ type: 'html', value: preceding });
      const script = scriptRecord(match[1], match[2]);
      if (script.src) throw new Error(`Body script should be supplied by the head: ${relative}`);
      bodySegments.push({ type: 'script', value: script.value ?? '' });
      cursor = start + match[0].length;
    }
    const trailing = normalizeMarkup(body.slice(cursor));
    if (trailing) bodySegments.push({ type: 'html', value: trailing });

    registry[route] = {
      title: decodeHtml(head.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? 'Bay Area Professional Counseling'),
      description: attr(head.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] ?? '', 'content') ?? '',
      bodyClass,
      styles,
      headScripts: scripts,
      bodySegments,
    };
  }

  writeFileSync(path.join(repository, 'content/legacy-pages.json'), `${JSON.stringify(registry)}\n`);
  console.log(`Compiled ${Object.keys(registry).length} pages into content/legacy-pages.json`);
} finally {
  rmSync(destination, { recursive: true, force: true });
  rmSync(urlConfig, { force: true });
}

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(target) : entry.isFile() && entry.name.endsWith('.html') ? [target] : [];
  });
}

function attr(markup, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return markup.match(new RegExp(`\\b${escaped}=["']([^"']*)["']`, 'i'))?.[1];
}

function scriptRecord(attributes, contents) {
  return {
    ...(attr(attributes, 'src') ? { src: normalizeUrl(attr(attributes, 'src')) } : {}),
    ...(attributes.match(/\basync\b/i) ? { async: true } : {}),
    ...(attributes.match(/\bdefer\b/i) ? { defer: true } : {}),
    ...(!attr(attributes, 'src') ? { value: contents } : {}),
  };
}

function normalizeUrl(value) {
  if (!value) return value;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/|#|data:)/i.test(value)) return value;
  return `/${value.replace(/^\/?(?:Bay-Area-Professional-Counseling-Site\/)?/, '')}`;
}

function normalizeMarkup(markup) {
  return markup.replace(/\b(src|href|poster|data-src|data-image)=(['"])([^'"]+)\2/gi, (whole, name, quote, value) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/|#|data:)/i.test(value)) return whole;
    if (/^(?:\.\/)?assets\//i.test(value)) return `${name}=${quote}/${value.replace(/^\.\//, '')}${quote}`;
    return whole;
  }).replace(/\bsrcset=(['"])([^'"]+)\1/gi, (whole, quote, value) => {
    const normalized = value.replace(/(^|,\s*)(?:\.\/)?assets\//g, '$1/assets/');
    return `srcset=${quote}${normalized}${quote}`;
  });
}

function decodeHtml(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
