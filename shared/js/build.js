import fs from 'fs';
import path from 'path';

const siteRoot = path.join(import.meta.dirname, '..', '..');
const srcDir = path.join(siteRoot, 'src');
const sharedDir = path.join(siteRoot, 'shared');
const publicDir = path.join(siteRoot, 'public');

const layoutPath = path.join(sharedDir, 'layout.html');
const analyticsPath = path.join(srcDir, 'includes', 'analytics.html');

function buildSite() {
    try {
        if (!fs.existsSync(layoutPath)) {
            console.error(`Fatal Error: layout.html missing at ${layoutPath}`);
            process.exit(1);
        }

        const layoutTemplate = fs.readFileSync(layoutPath, 'utf8');
        let analyticsBlock = '';
        if (fs.existsSync(analyticsPath)) {
            analyticsBlock = fs.readFileSync(analyticsPath, 'utf8');
        }

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

                    // Regex to find the front matter block between --- lines
                    const frontMatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/;
                    const match = pageContent.match(frontMatterRegex);

                    if (match) {
                        const frontMatter = match[1];
                        
                        // Extract the title variable from within the front matter
                        const titleMatch = frontMatter.match(/title:\s*(.*)/i);
                        if (titleMatch) {
                            pageTitle = titleMatch[1].trim();
                        }
                        
                        // Remove the entire front matter block from the content
                        pageContent = pageContent.replace(match[0], '').trim();
                    }

                    // Build the final HTML using the shared layout
                    let finalHtml = layoutTemplate
                        .split('{{TITLE}}').join(pageTitle)
                        .split('{{ANALYTICS}}').join(analyticsBlock)
                        .split('{{CONTENT}}').join(pageContent);

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