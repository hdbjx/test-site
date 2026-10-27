import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const APP = path.join(SRC, 'app');
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function routeFromPage(file) {
  const rel = path.relative(APP, path.dirname(file)).split(path.sep).filter(Boolean);
  const visible = rel.filter((part) => !(part.startsWith('(') && part.endsWith(')')));
  return '/' + visible.join('/');
}

const pageFiles = walk(APP).filter((file) => path.basename(file) === 'page.tsx');
const routes = pageFiles.map((file) => ({ route: routeFromPage(file), file }));
const routeRegexes = routes.map(({ route, file }) => {
  const escaped = route
    .split('/')
    .map((segment) => {
      if (!segment) return '';
      if (/^\[\.\.\.[^\]]+\]$/.test(segment)) return '.+';
      if (/^\[[^\]]+\]$/.test(segment)) return '[^/]+';
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return { regex: new RegExp(`^${escaped || '/'}$`), route, file };
});

function routeFileFor(pathname) {
  return routeRegexes.find(({ regex }) => regex.test(pathname))?.file ?? null;
}

function hasAnchor(file, anchor) {
  if (!file) return false;
  const text = fs.readFileSync(file, 'utf8');
  const exactDouble = `id=\"${anchor}\"`;
  const exactSingle = `id='${anchor}'`;
  return text.includes(exactDouble) || text.includes(exactSingle) || text.includes(`anchor: \"${anchor}\"`) || text.includes(`anchor: '${anchor}'`);
}

const codeFiles = walk(SRC).filter((file) => CODE_EXT.has(path.extname(file)));
const hrefPattern = /(?:href\s*=\s*|href\s*:\s*)["']([^"']+)["']/g;
const routerPattern = /router\.(?:push|replace)\(\s*["']([^"']+)["']/g;
const problems = [];
const internalLinks = [];

for (const file of codeFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of [hrefPattern, routerPattern]) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text))) {
      const href = match[1].trim();
      const line = text.slice(0, match.index).split('\n').length;
      if (!href || href === '#') {
        problems.push(`${path.relative(ROOT, file)}:${line} has an empty/dead href (${JSON.stringify(href)})`);
        continue;
      }
      if (!href.startsWith('/') && !href.startsWith('#')) continue;
      internalLinks.push({ file, line, href });
    }
  }
}

for (const { file, line, href } of internalLinks) {
  if (href.startsWith('#')) {
    // Same-document anchors inside reusable components cannot be mapped to a route
    // statically, so require that the anchor exists somewhere in the application.
    const anchor = href.slice(1);
    const exists = codeFiles.some((candidate) => {
      const text = fs.readFileSync(candidate, 'utf8');
      return text.includes(`id=\"${anchor}\"`) || text.includes(`id='${anchor}'`);
    });
    if (!exists) problems.push(`${path.relative(ROOT, file)}:${line} points to missing anchor ${href}`);
    continue;
  }

  const [beforeHash, anchor = ''] = href.split('#', 2);
  const pathname = (beforeHash.split('?', 1)[0] || '/').replace(/\/$/, '') || '/';
  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) continue;
  const target = routeFileFor(pathname);
  if (!target) {
    problems.push(`${path.relative(ROOT, file)}:${line} points to missing route ${pathname}`);
    continue;
  }
  if (anchor && !hasAnchor(target, anchor)) {
    problems.push(`${path.relative(ROOT, file)}:${line} points to missing anchor ${pathname}#${anchor}`);
  }
}


// Also validate route-qualified anchor strings used by computed navigation helpers.
// This catches stale destinations that do not appear directly in a JSX href.
const routeAnchorStringPattern = /["'](\/[^"'\s]*#[^"'\s]+)["']/g;
for (const file of codeFiles) {
  const text = fs.readFileSync(file, 'utf8');
  routeAnchorStringPattern.lastIndex = 0;
  let match;
  while ((match = routeAnchorStringPattern.exec(text))) {
    const href = match[1];
    if (href.includes('${') || href.startsWith('/#')) continue;
    const line = text.slice(0, match.index).split('\n').length;
    const [beforeHash, anchor = ''] = href.split('#', 2);
    const pathname = (beforeHash.split('?', 1)[0] || '/').replace(/\/$/, '') || '/';
    const target = routeFileFor(pathname);
    if (!target) {
      problems.push(`${path.relative(ROOT, file)}:${line} contains navigation to missing route ${pathname}`);
      continue;
    }
    if (anchor && !hasAnchor(target, anchor)) {
      problems.push(`${path.relative(ROOT, file)}:${line} contains navigation to missing anchor ${pathname}#${anchor}`);
    }
  }
}


// Validate link-bearing JSX itself. Every rendered anchor/link control must have an href,
// and JavaScript URLs are never allowed.
const jsxLinkPattern = /<(?:a|Link|TrackedLink)\b[^>]*>/gs;
for (const file of codeFiles.filter((f) => /\.(tsx|jsx)$/.test(f))) {
  const source = fs.readFileSync(file, 'utf8');
  let match;
  jsxLinkPattern.lastIndex = 0;
  while ((match = jsxLinkPattern.exec(source))) {
    const tag = match[0];
    const line = source.slice(0, match.index).split('\n').length;
    if (!/\bhref\s*=/.test(tag) && !/\{\.\.\.rest\}/.test(tag)) problems.push(`${path.relative(ROOT, file)}:${line} renders a link without href`);
    if (/href\s*=\s*["']javascript:/i.test(tag)) problems.push(`${path.relative(ROOT, file)}:${line} uses a javascript: href`);
  }
}

// Validate known booking query values that are hard-coded anywhere in the UI/data.
const validServices = new Set(['maintenance', 'premium', 'factoryReset']);
const bookingServicePattern = /\/book\?[^"'`\s]*\bservice=([A-Za-z0-9_-]+)/g;
for (const file of codeFiles) {
  const source = fs.readFileSync(file, 'utf8');
  let match;
  bookingServicePattern.lastIndex = 0;
  while ((match = bookingServicePattern.exec(source))) {
    if (!validServices.has(match[1])) {
      const line = source.slice(0, match.index).split('\n').length;
      problems.push(`${path.relative(ROOT, file)}:${line} uses invalid booking service ${match[1]}`);
    }
  }
}

// Dynamic route integrity: all service-area slugs must be unique, and all published
// blog filenames are valid generated slugs. The dynamic pages intentionally disable
// unknown params, so these lists are the source of truth.
const areasSource = fs.readFileSync(path.join(ROOT, 'src/data/areas.ts'), 'utf8');
const areaSlugs = [...areasSource.matchAll(/\bslug:\s*["']([^"']+)["']/g)].map((m) => m[1]);
if (new Set(areaSlugs).size !== areaSlugs.length) problems.push('src/data/areas.ts contains duplicate area slugs');
if (areaSlugs.some((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) problems.push('src/data/areas.ts contains an invalid area slug');
const areaPageSource = fs.readFileSync(path.join(ROOT, 'src/app/service-areas/[slug]/page.tsx'), 'utf8');
if (!/dynamicParams\s*=\s*false/.test(areaPageSource) || !/generateStaticParams/.test(areaPageSource)) problems.push('service-area dynamic route is missing static-param protection');

const blogDir = path.join(ROOT, 'content/blog');
const blogSlugs = fs.existsSync(blogDir) ? fs.readdirSync(blogDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')) : [];
if (new Set(blogSlugs).size !== blogSlugs.length) problems.push('content/blog contains duplicate post slugs');
if (blogSlugs.some((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) problems.push('content/blog contains an invalid post slug');
const postPageSource = fs.readFileSync(path.join(ROOT, 'src/app/post/[slug]/page.tsx'), 'utf8');
if (!/dynamicParams\s*=\s*false/.test(postPageSource) || !/generateStaticParams/.test(postPageSource)) problems.push('blog dynamic route is missing static-param protection');

// Interaction-layer guards. The decorative homepage cursor must never intercept clicks,
// while the three logo/home controls must remain explicitly interactive.
const css = fs.readFileSync(path.join(ROOT, 'src/app/globals.css'), 'utf8');
// Only enforced while the cursor element is still rendered somewhere.
const cursorRendered = fs.readdirSync(path.join(ROOT, 'src'), { recursive: true }).some((f) => /\.(tsx|ts)$/.test(String(f)) && fs.readFileSync(path.join(ROOT, 'src', String(f)), 'utf8').includes('v28-cursor"'));
if (cursorRendered && !/\.v28-cursor\{[^}]*pointer-events:none/.test(css)) problems.push('custom cursor can intercept pointer events');
const hardening = css.slice(css.lastIndexOf('/* V95 link interaction hardening */'));
for (const selector of ['.bk-top-logo', '.q51-top-logo', '.site-shared-logo-control']) {
  if (!hardening.includes(selector)) problems.push(`${selector} is missing from final link interaction hardening`);
}
if (!/pointer-events:\s*auto/.test(hardening)) problems.push('final link interaction hardening does not restore pointer events');


// Guard the three custom/global home-logo links. These are easy to visually cover
// with positioned header layers, so require an explicit home destination.
const logoFiles = [
  'src/components/Header.tsx',
  'src/components/QuoteTopBar.tsx',
  'src/components/forms/BookingTopBar.tsx',
];
for (const rel of logoFiles) {
  const file = path.join(ROOT, rel);
  const text = fs.readFileSync(file, 'utf8');
  if (!/href=["']\/["']/.test(text)) problems.push(`${rel} is missing a direct home link on its logo/header control`);
}

if (problems.length) {
  console.error('Link QA failed:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Link QA passed: ${internalLinks.length} static internal links checked across ${routes.length} page routes.`);
