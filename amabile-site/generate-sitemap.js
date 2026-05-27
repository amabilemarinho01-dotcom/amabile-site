const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://amabilemarinho.com.br';

const ignore = ['node_modules', '.git', '.github', 'assets', 'ativos'];

function getPages(dir, pages = []) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const filePath = path.join(dir, item);
    const normalized = filePath.replace(/\\/g, '/');

    if (ignore.some(folder => normalized.includes(`/${folder}`) || normalized.startsWith(folder))) {
      return;
    }

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getPages(filePath, pages);
      return;
    }

    const base = path.basename(filePath);

    if (
      base === 'index.html' ||
      (!base.includes('.') && !base.startsWith('.'))
    ) {
      pages.push(normalized);
    }
  });

  return pages;
}

const files = getPages('.');

const urls = files.map(file => {
  let url = file
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');

  if (url === 'index.html') {
    return DOMAIN;
  }

  url = url.replace(/\/index\.html$/, '');
  url = url.replace(/\/$/, '');

  return `${DOMAIN}/${url}`;
});

const uniqueUrls = [...new Set(urls)].sort();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(url => `  <url>
    <loc>${url}</loc>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync('sitemap.xml', sitemap);

console.log(`Sitemap gerado com ${uniqueUrls.length} URLs.`);
