import fs from 'fs';
import path from 'path';

const siteRoot = path.join(import.meta.dirname, '..', '..');
const srcDir = path.join(siteRoot, 'src');
const sharedDir = path.join(siteRoot, 'shared');
const publicDir = path.join(siteRoot, 'public');

const layoutPath = path.join(sharedDir, 'layout.html');
const configPath = path.join(siteRoot, 'config.json');

function buildSite() {
    try {
        if (!fs.existsSync(layoutPath)) {
            console.error(`Fatal Error: layout.html missing at ${layoutPath}`);
            process.exit(1);
        }

        const layoutTemplate = fs.readFileSync(layoutPath, 'utf8');
        
        // 1. Load the site config globally
        let siteConfig = { siteName: "Site", siteTitle: "Site", siteUrl: "", gtag: "" };
        if (fs.existsSync(configPath)) {
            siteConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } else {
            console.warn(`Warning: config.json missing at ${configPath}. Using defaults.`);
        }

        // 2. Generate Build Date variables globally
        const now = new Date();
        const buildDateIso = now.toISOString();
        const buildDateReadable = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        const pagesDir = path.join(srcDir, 'pages');
        
        function processDirectory(currentSrcDir, currentPubDir) {
            if (!fs.existsSync(currentPubDir)) fs.mkdirSync(currentPubDir, { recursive: true });

            const entries = fs.readdirSync(currentSrcDir, { withFileTypes: true });

            entries.forEach(entry => {
                const srcPath = path.join(currentSrcDir, entry.name);
                const pubPath = path.join(currentPubDir, entry.name);

                if (entry.isDirectory()) {
                    processDirectory(srcPath, pubPath);
                } else if (entry.isFile() && entry.name.endsWith('.html')) {
                    
                    let pageContent = fs.readFileSync(srcPath, 'utf8');
                    let pageTitle = "Untitled";
                    let pageDesc = "";

                    // Regex to find the front matter block between --- lines
                    const frontMatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/;
                    const match = pageContent.match(frontMatterRegex);

                    if (match) {
                        const frontMatter = match[1];
                        
                        // Extract the title
                        const titleMatch = frontMatter.match(/title:\s*(.*)/i);
                        if (titleMatch) pageTitle = titleMatch[1].trim();
                        
                        // Extract the description
                        const descMatch = frontMatter.match(/description:\s*(.*)/i);
                        if (descMatch) pageDesc = descMatch[1].trim();
                        
                        // Remove the entire front matter block from the content
                        pageContent = pageContent.replace(match[0], '').trim();
                    }

                    // 3. Generate Breadcrumbs dynamically based on file path
                    const relativePath = path.relative(publicDir, pubPath).replace(/\\/g, '/');
                    const pathParts = relativePath.split('/').filter(p => p !== 'index.html' && p !== '');

                    let breadcrumb = `<a href="/">${siteConfig.siteName}</a>`;
                    let currentPath = '';

                    pathParts.forEach((part, index) => {
                        currentPath += `/${part}`;
                        const displayPart = part.charAt(0).toUpperCase() + part.slice(1);
                        
                        if (index === pathParts.length - 1) {
                            breadcrumb += ` / <span>${displayPart}</span>`;
                        } else {
                            breadcrumb += ` / <a href="${currentPath}/">${displayPart}</a>`;
                        }
                    });

                    // 4. Default JSON-LD to empty unless added later
                    let jsonLdBlock = '';

                    // 5. Build the final HTML replacing all placeholders
                    let finalHtml = layoutTemplate
                        .replaceAll('{{SITE_NAME}}', siteConfig.siteName)
                        .replaceAll('{{SITE_TITLE}}', siteConfig.siteTitle)
                        .replaceAll('{{GTAG}}', siteConfig.gtag)
                        .replaceAll('{{BREADCRUMB}}', breadcrumb)
                        .replaceAll('{{BUILD_DATE_ISO}}', buildDateIso)
                        .replaceAll('{{BUILD_DATE_READABLE}}', buildDateReadable)
                        .replaceAll('{{PAGE_TITLE}}', pageTitle)
                        .replaceAll('{{PAGE_DESC}}', pageDesc)
                        .replaceAll('{{JSON_LD}}', jsonLdBlock)
                        .replaceAll('{{CONTENT}}', pageContent);

                    fs.writeFileSync(pubPath, finalHtml);
                    console.log(`Compiled: ${path.relative(publicDir, pubPath)}`);
                }
            });
        }

        if (fs.existsSync(publicDir)) fs.rmSync(publicDir, { recursive: true, force: true });
        
        processDirectory(pagesDir, publicDir);
        
        // Copy CSS
        const cssPubDir = path.join(publicDir, 'css');
        const sharedCssDir = path.join(sharedDir, 'css');
        if (fs.existsSync(sharedCssDir)) {
            fs.mkdirSync(cssPubDir, { recursive: true });
            fs.readdirSync(sharedCssDir).filter(f => f.endsWith('.css')).forEach(f => {
                fs.copyFileSync(path.join(sharedCssDir, f), path.join(cssPubDir, f));
            });
        }

        console.log('Build complete.');
    } catch (error) {
        console.error('Fatal Error:', error.message);
        process.exit(1);
    }
}

buildSite();