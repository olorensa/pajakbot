const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const TurndownService = require('turndown');

const turndownService = new TurndownService();

// Define the base path to remove from URLs
const basePathToRemove = `file://${path.resolve(__dirname, 'on google vm').replace(/\\/g, '/')}/`;

async function scrapePage(page, url, lang) {
    try {
        await page.goto(url, { waitUntil: 'networkidle0' });
        const htmlContent = await page.evaluate((lang) => {
            const contentSelector = lang === 'en' ? '.content-en' : '.content-hu';
            const contentAreas = document.querySelectorAll(contentSelector);

            if (contentAreas.length === 0) {
                console.log(`[DEBUG] Selector ${contentSelector} not found on page.`);
                return '';
            }

            console.log(`[DEBUG] Found ${contentAreas.length} contentArea(s) for ${contentSelector}.`);
            
            let combinedHtml = '';
            contentAreas.forEach(contentArea => {
                contentArea.querySelectorAll('script, style').forEach(el => el.remove());
                combinedHtml += contentArea.innerHTML + '\n'; // Get innerHTML for Turndown
            });
            return combinedHtml;
        }, lang);

        if (!htmlContent.trim()) {
            return '';
        }

        let markdown = turndownService.turndown(htmlContent);

        // Add full stop if missing and not ending with common punctuation
        markdown = markdown.split('\n').map(line => {
            line = line.trim();
            if (line && !/[.!?]$/.test(line)) {
                return line + '.';
            }
            return line;
        }).join('\n');

        // Ensure newlines between distinct content blocks (heuristic based on Turndown output)
        markdown = markdown.replace(/\n\s*\n/g, '\n\n'); // Collapse multiple newlines
        markdown = markdown.replace(/\n([a-zA-Z0-9])/g, '\n\n$1'); // Add newline before new paragraphs/lines

        console.log(`[DEBUG] Markdown content length for ${url} (${lang}): ${markdown.length}`);

        // Clean up the URL for the Markdown header
        const normalizedUrl = url.replace(/\\/g, '/'); // Normalize URL path separators
        const cleanedUrl = normalizedUrl.replace(basePathToRemove, '');

        return `--- Page: ${cleanedUrl} ---\n\n${markdown}\n\n`;

    } catch (error) {
        console.error(`Error scraping ${url} for lang ${lang}: ${error.message}`);
        return '';
    }
}

async function scrapeSection(page, section, lang) {
    console.log(`--- Starting to scrape ${section} section for [${lang.toUpperCase()}] ---`);
    const baseUrl = `file://${path.join(__dirname, 'on google vm', section)}`;
    const indexPath = `${baseUrl}/index.html`;

    await page.goto(indexPath, { waitUntil: 'domcontentloaded' });

    try {
        await page.waitForFunction('window.menuStructure !== undefined', { timeout: 10000 });
    } catch (e) {
        console.error(`Could not find menuStructure for section: ${section}. Aborting this section.`);
        return '';
    }

    const menuStructure = await page.evaluate(() => window.menuStructure);
    let sectionKnowledgeBase = '';

    for (const sectionId in menuStructure) {
        if (sectionId !== 'projects') {
            const sectionData = menuStructure[sectionId];
            const url = `${baseUrl}/${sectionData.defaultPage}`;
            console.log(`Scraping: ${url}`);
            sectionKnowledgeBase += await scrapePage(page, url, lang);
        }
    }

    const projects = menuStructure.projects;
    if (projects && projects.categories) {
        for (const categoryKey in projects.categories) {
            const category = projects.categories[categoryKey];
            for (const project of category.projects) {
                const url = `${baseUrl}/${project.page}`;
                console.log(`Scraping: ${url}`);
                sectionKnowledgeBase += await scrapePage(page, url, lang);
            }
        }
    }
    console.log(`--- Finished scraping ${section} section for [${lang.toUpperCase()}] ---\n`);
    return sectionKnowledgeBase;
}

async function scrapeAll() {
    console.log('Launching headless browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Forward browser console messages to Node.js console
    page.on('console', msg => {
        for (let i = 0; i < msg.args().length; ++i) {
            console.log(`[Browser Console] ${msg.text()}`);
        }
    });

    let knowledgeBaseEN = '';
    let knowledgeBaseHU = '';

    // --- Scrape English Content ---
    console.log('=========================================');
    console.log('=== STARTING ENGLISH CONTENT SCRAPE ===');
    console.log('=========================================\n');
    const mainIndexUrl = `file://${path.join(__dirname, 'on google vm', 'index.html')}`;
    knowledgeBaseEN += await scrapePage(page, mainIndexUrl, 'en');
    knowledgeBaseEN += await scrapeSection(page, 'architecture', 'en');
    knowledgeBaseEN += await scrapeSection(page, 'software', 'en');

    // --- Scrape Hungarian Content ---
    console.log('===========================================');
    console.log('=== STARTING HUNGARIAN CONTENT SCRAPE ===');
    console.log('===========================================\n');
    knowledgeBaseHU += await scrapePage(page, mainIndexUrl, 'hu');
    knowledgeBaseHU += await scrapeSection(page, 'architecture', 'hu');
    knowledgeBaseHU += await scrapeSection(page, 'software', 'hu');

    await browser.close();

    // --- Write Files ---
    fs.writeFileSync('knowledge_base_en.md', knowledgeBaseEN);
    console.log('English knowledge base saved to knowledge_base_en.md');

    fs.writeFileSync('knowledge_base_hu.md', knowledgeBaseHU);
    console.log('Hungarian knowledge base saved to knowledge_base_hu.md');

    console.log('\nCrawling finished successfully.');
}

scrapeAll();