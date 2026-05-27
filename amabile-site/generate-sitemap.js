const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://amabilemarinho.com.br';

function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    if (
      filePath.includes('node_modules') ||
      filePath.includes('.git') ||
      filePath.includes('.github')
    ) {
      return;
    }

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getHtmlFiles(filePath, fileList);
    } else if (file === 'index.html') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const files = getHtmlFiles('./');

const urls = files.map(file => {
  let url = file
    .replace(/\\/g, '/')
    .replace('index.html', '')
    .replace('./', '');

  if (url === '') {
    return DOMAIN;
  }

  return `${DOMAIN}/${url.replace(/\/$/, '')}`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `
  <url>
    <loc>${url}</loc>
  </url>
`).join('')}
</urlset>`;

fs.writeFileSync('sitemap.xml', sitemap);

console.log('Sitemap gerado com sucesso!');
