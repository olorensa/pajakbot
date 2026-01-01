// js/languageSwitcher.js

// --- Translation Data ---
// IMPORTANT: Ensure this object contains ALL necessary translations.
const translations = {
    'HU': {
        // Top Menu (IDs) & Static Links (Add IDs if they exist)
        'about': 'Rólam',
        'services': 'Szolgáltatások',
        'projects': 'Projektek',
        'contact': 'Kapcsolat',
        'Back to Main': 'Vissza a főoldalra',
        'Toggle Sidebar': 'Oldalsáv Ki/Be', // Example title translation

        // Architecture Categories & Projects
        'Commercial': 'Kereskedelmi',
        'Hamad International Airport': 'Hamad Nemzetközi Repülőtér',
        'Qatar National Convention Center': 'Katari Nemzeti Kongresszusi Központ',
        'Ferrari World Abu Dhabi': 'Ferrari Világ Abu Dhabi',
        'Hunguest BÁL Resort': 'Hunguest BÁL Resort',
        'Tengiz': 'Tengiz',
        'Bakony Integrated Social Institution': 'Bakony Integrált Szociális Intézmény',
        'Nagykáta City Library': 'Nagykátai Városi Könyvtár',
        'Taksony German Nationality Kindergarten': 'Taksonyi Német Nemzetiségi Óvoda',
        'Tamási Cultural Center': 'Tamási Kulturális Központ',
        'Highrise': 'Magasház',
        'Four Seasons Hotel, Bahrain': 'Four Seasons Hotel, Bahrain',
        'ADNOC Headquarters': 'ADNOC Székház',
        'Burj Khalifa': 'Burdzs Kalifa',
        'Residential': 'Lakóépület',
        '28 Flats Residential Development': '28 Lakásos Társasház Fejlesztés',

        // Software Categories & Projects
        'AI': 'MI',
        'LlamaParse Test': 'LlamaParse Teszt',
        'Email on Autopilot': 'Email Automata Pilóta',
        'LightRAG-Chat': 'LightRAG-Chat',
        'Youtube Chronicle': 'Youtube Krónika',
        'News Webpage': 'Hírportál',
        'RAG_64': 'RAG_64',
        'Bookmark Genie': 'Könyvjelző Dzsinn',
        'visR': 'visR',
        'RAG Chatbot with Gemini': 'RAG Chatbot Geminivel',
        'Archi': 'Építész Szoftver',
        'Unreal - Guide for Architects': 'Unreal - Útmutató Építészeknek',
        'Unreal - Guide for Archviz': 'Unreal - Útmutató Látványtervezőknek',
        'Archicad Python API': 'Archicad Python API',
        'Archicad Python Scripts': 'Archicad Python Scriptek',
        'Gaming': 'Játék',
        'Pongify': 'Pongify',
        'Atomremix': 'Atomremix',
        'Apples in Space': 'Alma az űrben',
        'Other': 'Egyéb',
        'FTP/SFTP Debian': 'FTP/SFTP Debian',
        'Set Up Website': 'Weboldal Beállítása',
        'Hosting n8n': 'n8n Hosztolása',
        'Chrome Extension, Firebase, Stripe': 'Chrome Bővítmény, Firebase, Stripe',
        'Trading BOT': 'Kereskedő BOT',
        'Real Estate Analyzer': 'Ingatlan Elemző',
        'TSV to Postgress': 'TSV-ből Postgresbe',

        // Specific Elements (like buttons on main index)
        'Enter Architecture Section ➔': 'Belépés az Építészet szekcióba ➔',
        'Enter Software Section ➔': 'Belépés a Szoftver szekcióba ➔',

        // Footer
         '© 2024 Accaderi. All rights reserved.': '© 2024 Accaderi. Minden jog fenntartva.',

        // Page Titles (Example - needs data attributes or better handling)
        'accaderi.hu': 'accaderi.hu',
        'Architecture & Engineering - Accaderi': 'Építészet és Mérnöki Szolgáltatások - Accaderi',
        'Software & AI - Accaderi': 'Szoftver és MI - Accaderi',
        // Add titles for iframe content pages if needed
    }
};


function getEffectiveAppLanguage() {
    try {
        // 1. Check URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        let langFromUrl = urlParams.get('lang');

        if (langFromUrl) {
            langFromUrl = langFromUrl.toUpperCase();
            if (langFromUrl === 'EN' || langFromUrl === 'HU') {
                localStorage.setItem('lang', langFromUrl);
                return langFromUrl;
            }
        }

        // 2. Check localStorage if no valid URL param
        let langFromStorage = localStorage.getItem('lang');
        if (langFromStorage === 'EN' || langFromStorage === 'HU') {
            return langFromStorage;
        }

        // 3. Check browser language
        let browserLangPreference = null;
        if (navigator.languages && navigator.languages.length) {
            for (const lang of navigator.languages) {
                const l = lang.toLowerCase();
                if (l.startsWith('hu')) { browserLangPreference = 'HU'; break; }
                if (l.startsWith('en') && !browserLangPreference) { browserLangPreference = 'EN'; }
            }
        } else if (navigator.language || navigator.userLanguage) {
            const singleBrowserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
            if (singleBrowserLang.startsWith('hu')) browserLangPreference = 'HU';
            else if (singleBrowserLang.startsWith('en')) browserLangPreference = 'EN';
        }
        
        if (browserLangPreference === 'HU') {
            localStorage.setItem('lang', 'HU');
            return 'HU';
        }

        // 4. Default to EN
        localStorage.setItem('lang', 'EN');
        return 'EN';

    } catch (error) {
        console.error("Error in getEffectiveAppLanguage:", error);
        try { localStorage.setItem('lang', 'EN'); } catch (e) {}
        return 'EN';
    }
}

window.getEffectiveAppLanguage = getEffectiveAppLanguage;

/**
 * Translates a given text key using the global 'translations' object.
 * Exposed globally for use by script_indexes.js.
 * @param {string} key - The English text or identifier key.
 * @param {('EN'|'HU')} lang - The target language code.
 * @returns {string} The translated text or the original key if no translation exists.
 */
function translate(key, lang) {
    const strKey = String(key); // Ensure key is a string
    const targetLang = (typeof lang === 'string' && lang.toUpperCase() === 'HU') ? 'HU' : 'EN';

    if (targetLang === 'HU' && translations.HU && translations.HU.hasOwnProperty(strKey)) {
        // console.log(" -> Found translation:", translations.HU[strKey]);
        return translations.HU[strKey];
    }
    return strKey; // Return original key if EN or translation missing
}
// Expose ONLY the translation utility globally
// Note: Global exposure isn't ideal in large apps, but simplifies communication here.
window.translateMenuItem = translate;

/**
 * Gets the current language preference.
 * --- THIS FUNCTION IS MODIFIED ---
 * @returns {('EN'|'HU')} The determined language code.
 */
function getLang() {
    // MODIFIED: Now delegates to the new getEffectiveAppLanguage function
    return window.getEffectiveAppLanguage();
}

/**
 * Sets the language preference in localStorage.
 * @param {('EN'|'HU')} newLang - The language code to set.
 */
function setLang(newLang) {
    try {
        if (newLang === 'EN' || newLang === 'HU') {
            localStorage.setItem('lang', newLang);
        } else {
            console.warn(`Attempted to set invalid language: ${newLang}`);
        }
    } catch (error) {
        console.error("Error setting language in localStorage:", error);
    }
}

/**
 * Updates the text content of STATIC menu items based on the current language.
 * Dynamic items (categories, projects) are handled by script_indexes.js during creation.
 * @param {('EN'|'HU')} lang - The target language.
 */
function updateMenuLanguage(lang) {
    // Target only the main top-level links IF THEY ARE STATIC HTML
    // and the back-to-main link. Adjust selectors if structure differs.
    document.querySelectorAll('#top-menu-items a, #top-menu-items button').forEach(item => {
        // Skip dynamically added menu items explicitly
        if (item.classList.contains('category-link') || item.closest('.submenu')) {
            return;
        }
        // Handle sidebar toggle button title translation
        if (item.id === 'toggle-sidebar') {
            const originalTitle = item.getAttribute('data-original-title') || 'Toggle Sidebar';
             if (!item.hasAttribute('data-original-title')) {
                 item.setAttribute('data-original-title', originalTitle); // Store original on first run
             }
            item.title = translate(originalTitle, lang);
            return; // Don't translate text content of toggle button
        }

        let key = item.id; // Prioritize ID
        let originalText = '';

        // Store original text if not already stored (for items without ID like back-to-main)
        if (!key && !item.hasAttribute('data-original-text')) {
            originalText = item.textContent.trim();
            if (originalText) {
                 item.setAttribute('data-original-text', originalText);
                 key = originalText;
            }
        } else if (!key) {
            originalText = item.getAttribute('data-original-text');
            key = originalText;
        }

        if (key) {
            let translatedText = translate(key, lang);

            // Optional: Fallback to original text if ID-based translation fails
            if (translatedText === key && item.id) {
                 if (!item.hasAttribute('data-original-text')) {
                     const currentText = item.textContent.trim();
                     if(currentText) item.setAttribute('data-original-text', currentText);
                 }
                 translatedText = item.getAttribute('data-original-text') || key;
            }

            if (item.textContent.trim() !== translatedText) {
                item.textContent = translatedText;
            }
        }
    });
}


/**
 * Updates specific elements identified by selectors based on language.
 * Used for elements not conveniently wrapped in content-en/hu divs.
 * @param {('EN'|'HU')} lang - The target language.
 */
function updateSpecificElements(lang) {
    try {
        // --- Update page title ---
        const titleElement = document.querySelector('title');
        if (titleElement) {
            if (!titleElement.hasAttribute('data-original-title-en')) {
                titleElement.setAttribute('data-original-title-en', titleElement.textContent);
            }
            const enTitle = titleElement.getAttribute('data-original-title-en');
            const translatedTitle = translate(enTitle, lang);
             if (titleElement.textContent !== translatedTitle) {
                 titleElement.textContent = translatedTitle;
             }
        }

        // --- Update link buttons on the main index page ---
        const buttonsToTranslate = [
            { selector: '#architecture-button', originalKey: 'Enter Architecture Section ➔' },
            { selector: 'a[href="software/index.html"].lang-to-path', originalKey: 'Enter Software Section ➔' }
        ];
        buttonsToTranslate.forEach(item => {
            const element = document.querySelector(item.selector);
            if (element) {
                 const translatedText = translate(item.originalKey, lang);
                 if (element.textContent.trim() !== translatedText) {
                     element.textContent = translatedText;
                 }
            }
        });

        // --- Update footer text (If NOT using content-en/hu divs for footer) ---
        // If footer IS using content-en/hu divs, this is not needed.
        /*
        const footerTextElement = document.getElementById('footer-text');
        if (footerTextElement && !footerTextElement.closest('.content-en, .content-hu')) {
            const originalFooterText = '© 2024 Accaderi. All rights reserved.';
            const translatedFooterText = translate(originalFooterText, lang);
             if (footerTextElement.textContent.trim() !== translatedFooterText) {
                 footerTextElement.textContent = translatedFooterText;
             }
        }
        */

    } catch (error) {
       console.error("Error updating specific elements:", error);
    }
}

/**
 * Applies the selected language to the page elements managed by this script.
 * Hides/shows content divs, updates HTML lang, button text, static menus, specific elements.
 * @param {('EN'|'HU')} lang - The language code to apply.
 */
function applyLanguage(lang) {
   try {
       const effectiveLang = (lang === 'HU') ? 'HU' : 'EN';
       // console.log("Applying language:", effectiveLang);

       // --- Post message to chatbot iframe ---
       const iframe = document.getElementById('chat-widget-iframe');
       if (iframe && iframe.contentWindow) {
           iframe.contentWindow.postMessage({ type: 'SET_LANGUAGE', lang: effectiveLang }, 'https://rag-chatbot-with-gemini.vercel.app');
       }
       // --- End post message ---

       // 1. Update HTML lang attribute
       document.documentElement.lang = effectiveLang.toLowerCase();

       // 2. Show/Hide content divs
       const contentEN = document.querySelectorAll('.content-en');
       const contentHU = document.querySelectorAll('.content-hu');
       const defaultDisplay = 'block'; // Adjust if needed (e.g., 'flex', 'grid')

       if (effectiveLang === 'HU') {
           contentEN.forEach(el => el.style.display = 'none');
           contentHU.forEach(el => el.style.display = defaultDisplay);
       } else {
           contentHU.forEach(el => el.style.display = 'none');
           contentEN.forEach(el => el.style.display = defaultDisplay);
       }

        // Handle footers specifically if they use content-en/hu classes
        const footerEN = document.querySelector('.footer.content-en');
        const footerHU = document.querySelector('.footer.content-hu');
        if(footerEN && footerHU) {
             const footerDisplay = 'flex'; // Assume footer uses flex
             footerEN.style.display = (effectiveLang === 'EN') ? footerDisplay : 'none';
             footerHU.style.display = (effectiveLang === 'HU') ? footerDisplay : 'none';
        }

       // 3. Update Language Button Text
       const langButton = document.getElementById('lang-button');
       if (langButton) {
           langButton.textContent = (effectiveLang === 'EN') ? 'HU' : 'EN';
       }

       // 4. Update STATIC Menu Item Text ONLY
       // console.log(" -> Calling updateMenuLanguage (for static items)");
       updateMenuLanguage(effectiveLang);

       // 5. Update other specific elements (non-menu)
       // console.log(" -> Calling updateSpecificElements");
       updateSpecificElements(effectiveLang);

   } catch (error) {
       console.error("Error applying language:", error);
       // Fallback to English display on error
       try {
           document.documentElement.lang = 'en';
           document.querySelectorAll('.content-hu').forEach(el => el.style.display = 'none');
           document.querySelectorAll('.content-en').forEach(el => el.style.display = 'block');
           const langButton = document.getElementById('lang-button');
           if (langButton) langButton.textContent = 'HU';
       } catch (fallbackError) {
           console.error("Error during fallback to English:", fallbackError);
       }
   }
}

/** Reloads the content iframe if present and security allows. */
function reloadIframe() {
   const contentFrame = document.getElementById('content-frame');
    if (contentFrame && contentFrame.contentWindow) {
       if (window.location.protocol !== 'file:') {
           try {
               // console.log(" --> Reloading iframe");
               contentFrame.contentWindow.location.reload();
           } catch (reloadError) {
               console.warn("Could not reload iframe automatically. Error:", reloadError);
           }
       } else {
            console.warn("Running from file:// protocol. Cannot reliably reload iframe.");
       }
    } else {
        // console.log("No iframe found to reload or not accessible.");
    }
}

/**
* Initializes the language switcher functionality.
*/
function initLangSwitcher() {
   const langButton = document.getElementById('lang-button');
   const currentLang = getLang(); // This correctly uses getEffectiveAppLanguage

   applyLanguage(currentLang);

   if (langButton) {
       // --- ADD A FLAG TO TRACK IF URL PARAM WAS USED INITIALLY ---
       let languageInitiallySetByUrl = false;
       const initialUrlParams = new URLSearchParams(window.location.search);
       if (initialUrlParams.has('lang')) {
           const langFromUrl = initialUrlParams.get('lang').toUpperCase();
           if (langFromUrl === 'EN' || langFromUrl === 'HU') {
               languageInitiallySetByUrl = true;
           }
       }
       // --- END OF FLAG ADDITION ---

       langButton.addEventListener('click', () => {
           const langBeforeClick = getLang(); // This will reflect current state (possibly from URL if not yet clicked)
           const newLang = langBeforeClick === 'EN' ? 'HU' : 'EN';

           setLang(newLang); // Update localStorage with the new choice
           applyLanguage(newLang); // Apply to current page static elements

           // --- LOGIC TO REMOVE URL PARAMETER ---
           if (languageInitiallySetByUrl) {
               const currentUrl = new URL(window.location.href);
               currentUrl.searchParams.delete('lang');
               // Update the URL without reloading the page
               window.history.replaceState({}, '', currentUrl.toString());
               languageInitiallySetByUrl = false; // Clear the flag, user's click now takes precedence
               // console.log("Language URL parameter removed after button click.");
           }

           // --- ADDED: Dispatch custom event for language change ---
           try {
               const event = new CustomEvent('languageChanged', { detail: { lang: newLang } });
               window.dispatchEvent(event);
           } catch (e) {
               console.error("Error dispatching languageChanged event:", e);
           }
           // --- END ADDITION ---

           // 3. Check if we need to force dynamic menu rebuild (on section pages)
           const sideMenuExists = document.getElementById('side-menu');
           const topMenuExists = document.getElementById('top-menu-items');
           const buildMenuItemsExists = typeof window.buildMenuItems === 'function';
           const menuStructureExists = typeof window.menuStructure !== 'undefined';

           let dynamicMenuRebuilt = false;
           if (sideMenuExists && topMenuExists && buildMenuItemsExists && menuStructureExists) {
               // Likely on a section page, attempt to rebuild dynamic menu
                const activeSectionLink = document.querySelector('#top-menu-items > a.active');
                const activeSectionId = activeSectionLink ? activeSectionLink.id : null;

                if (activeSectionId && window.menuStructure[activeSectionId] && window.menuStructure[activeSectionId].hasSubmenu) {
                    try {
                         // console.log(` --> Rebuilding menu for section: ${activeSectionId}`);
                         window.buildMenuItems(activeSectionId, window.menuStructure[activeSectionId]);
                         dynamicMenuRebuilt = true; // Mark as rebuilt
                    } catch (buildError) {
                         console.error("Error directly calling buildMenuItems:", buildError);
                         // Fallback will just reload iframe below
                    }
                } else {
                     // console.log(" -> Active section has no submenu or not found, skipping direct rebuild.");
                }
           } else {
                // console.log(" -> Not on a section page or buildMenuItems not available.");
           }

           // --- ADDITION: Update chatbot iframe source before reload ---
           try {
                const chatbotIframe = document.getElementById('chat-widget-iframe');
                if (chatbotIframe) {
                    const currentSrc = new URL(chatbotIframe.src);
                    currentSrc.searchParams.set('lang', newLang);
                    chatbotIframe.src = currentSrc.toString();
                }
           } catch(e) {
                console.error("Error updating chatbot iframe src:", e);
           }
           // --- END ADDITION ---

           // 4. Reload iframe content to reflect the new language
           // This is needed regardless of whether dynamic menu was rebuilt,
           // to update the content within the iframe itself.
           reloadIframe(); // <-- RESTORED to ensure chatbot language changes

           // --- ADDED: Run visitor counter for the new language ---
                try {
                    if (typeof checkVisitor === 'function') {
                        checkVisitor(); 
                    } else {
                        console.warn('Visitor counter function (checkVisitor) not found.');
                    }
                } catch (e) {
                    console.error("Error during checkVisitor call:", e);
                }
                // --- END ADDITION ---

       });
   }
   // NO MutationObserver needed here
}

// --- Run Initialization ---
if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', initLangSwitcher);
} else {
   initLangSwitcher(); // DOMContentLoaded has already fired
}