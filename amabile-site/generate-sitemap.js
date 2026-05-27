/**
 * generate-sitemap.js
 * 
 * Gera automaticamente o sitemap.xml varrendo todos os arquivos .html do projeto.
 * 
 * Como usar:
 *   node generate-sitemap.js
 * 
 * Configurações:
 *   - BASE_URL: URL base do seu site
 *   - IGNORE_DIRS: pastas que devem ser ignoradas
 *   - IGNORE_FILES: arquivos específicos que não devem entrar no sitemap
 */

const fs = require("fs");
const path = require("path");

// ============================================================
// CONFIGURAÇÕES — ajuste conforme o seu projeto
// ============================================================
const BASE_URL = "https://seusite.com.br"; // 👈 troque pela URL do seu site
const OUTPUT_FILE = "sitemap.xml";
const IGNORE_DIRS = ["node_modules", ".git", ".github", "dist", "vendor"];
const IGNORE_FILES = ["404.html", "offline.html"];
// ============================================================

/**
 * Varre recursivamente um diretório e retorna todos os arquivos .html encontrados.
 */
function findHtmlFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        findHtmlFiles(fullPath, fileList);
      }
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".html") &&
      !IGNORE_FILES.includes(entry.name)
    ) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

/**
 * Converte o caminho do arquivo em uma URL amigável.
 * Ex: ./artigos/meu-post.html → https://seusite.com.br/artigos/meu-post.html
 *     ./index.html            → https://seusite.com.br/
 */
function fileToUrl(filePath) {
  let relative = filePath
    .replace(/^\.\//, "")   // remove "./" do início
    .replace(/\\/g, "/");   // normaliza separadores no Windows

  // Transforma index.html da raiz em "/"
  if (relative === "index.html") return `${BASE_URL}/`;

  // Transforma outros index.html em URL de pasta: artigos/index.html → artigos/
  if (relative.endsWith("/index.html")) {
    relative = relative.replace("/index.html", "/");
  }

  return `${BASE_URL}/${relative}`;
}

/**
 * Retorna a data de última modificação do arquivo no formato YYYY-MM-DD.
 */
function getLastmod(filePath) {
  const stat = fs.statSync(filePath);
  return stat.mtime.toISOString().split("T")[0];
}

/**
 * Monta o XML do sitemap.
 */
function buildSitemap(files) {
  const urls = files
    .map((file) => {
      const loc = fileToUrl(file);
      const lastmod = getLastmod(file);
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ── Main ─────────────────────────────────────────────────────
const rootDir = process.cwd();
console.log(`🔍 Varrendo arquivos HTML em: ${rootDir}`);

const htmlFiles = findHtmlFiles(".");
console.log(`✅ ${htmlFiles.length} página(s) encontrada(s).`);

const sitemapXml = buildSitemap(htmlFiles);
fs.writeFileSync(OUTPUT_FILE, sitemapXml, "utf8");

console.log(`🗺️  Sitemap gerado com sucesso: ${OUTPUT_FILE}`);
htmlFiles.forEach((f) => console.log(`   • ${fileToUrl(f)}`));
