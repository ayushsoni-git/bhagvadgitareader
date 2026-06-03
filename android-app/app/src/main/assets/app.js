// Core Application State
const state = {
  screen: 'home',
  activeChapter: null,
  activeVerse: null,
  fontSize: 'medium', // small, medium, large, xlarge
  theme: 'light',      // light, dark
  elements: {
    sa: true,
    translit: true,
    hi: true,
    en: true
  },
  bookmarks: [],
  bookmarkMeta: {}, // { "2.47": { notes: "...", tags: [...] } }
  quoteOfTheDay: {
    date: '',
    verseKey: '2.47'
  },
  previousReaderChapter: null,
  previousReaderScrollKey: null
};

// Hand-curated list of the 50 most profound, inspiring, and famous verses in the Gita
const FAMOUS_VERSES = [
  "2.13", "2.14", "2.20", "2.22", "2.23", "2.24", "2.27", "2.30", "2.38", "2.47", 
  "2.62", "2.63", "3.9",  "3.19", "3.21", "3.35", "3.42", "4.7",  "4.8",  "4.9", 
  "4.13", "4.34", "4.39", "5.18", "5.22", "5.29", "6.5",  "6.26", "6.40", "6.47", 
  "7.7",  "7.14", "7.16", "7.19", "8.5",  "9.22", "9.26", "9.27", "9.30", "9.34", 
  "10.20", "10.41", "11.12", "11.33", "12.13", "12.14", "15.1", "15.7", "15.15", 
  "18.61", "18.65", "18.66"
];

// Document Elements
let dom = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initDOMSelectors();
  loadPreferences();
  initQuoteOfTheDay();
  renderChapters();
  initEventListeners();
  updateBookmarksUI();
  handleHashRouting();
  initSwipeToClose();
  initContinueReading();
  initGuidedReadingPaths();
});

// Cache DOM selectors for speed and clean access
function initDOMSelectors() {
  dom = {
    app: document.getElementById('app'),
    screenHome: document.getElementById('screen-home'),
    screenChapters: document.getElementById('screen-chapters'),
    screenReader: document.getElementById('screen-reader'),
    chaptersGrid: document.getElementById('chapters-grid'),
    
    // Header buttons
    btnHeaderHome: document.getElementById('btn-header-home'),
    btnToggleBookmarks: document.getElementById('btn-toggle-bookmarks'),
    btnToggleSettings: document.getElementById('btn-toggle-settings'),
    bookmarkBadge: document.getElementById('bookmark-badge'),
    
    // Quote cards & Search
    quoteShloka: document.getElementById('quote-shloka'),
    quoteTranslationEn: document.getElementById('quote-translation-en'),
    quoteRef: document.getElementById('quote-ref'),
    btnQuoteView: document.getElementById('btn-quote-view'),
    btnRefreshQuote: document.getElementById('btn-refresh-quote'),
    inputSearch: document.getElementById('input-search'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    searchResults: document.getElementById('search-results'),
    
    // Reader screen
    readerChNum: document.getElementById('reader-ch-num'),
    readerChTitle: document.getElementById('reader-ch-title'),
    readerChMeaning: document.getElementById('reader-ch-meaning'),
    readerChVerses: document.getElementById('reader-ch-verses'),
    versesListContainer: document.getElementById('verses-list-container'),
    btnReaderBack: document.getElementById('btn-reader-back'),
    
    // Reader setting controls
    btnFontDec: document.getElementById('btn-font-dec'),
    btnFontInc: document.getElementById('btn-font-inc'),
    fontSizeLabel: document.getElementById('font-size-label'),
    toggleSa: document.getElementById('toggle-sa'),
    toggleTranslit: document.getElementById('toggle-translit'),
    toggleHi: document.getElementById('toggle-hi'),
    toggleEn: document.getElementById('toggle-en'),
    inlineToggleSa: document.getElementById('inline-toggle-sa'),
    inlineToggleHi: document.getElementById('inline-toggle-hi'),
    inlineToggleEn: document.getElementById('inline-toggle-en'),
    
    // Chapter navigation footer
    btnPrevChapter: document.getElementById('btn-prev-chapter'),
    btnNextChapter: document.getElementById('btn-next-chapter'),
    btnReaderChaptersMenu: document.getElementById('btn-reader-chapters-menu'),
    
    // Floating Quick Navigation
    readerQuickNav: document.getElementById('reader-quick-nav'),
    btnQuickNavTrigger: document.getElementById('btn-quick-nav-trigger'),
    quickNavLabel: document.getElementById('quick-nav-label'),
    panelQuickNav: document.getElementById('panel-quick-nav'),
    btnCloseQuickNav: document.getElementById('btn-close-quick-nav'),
    quickNavChapters: document.getElementById('quick-nav-chapters'),
    quickNavChaptersList: document.getElementById('quick-nav-chapters-list'),
    quickNavVerses: document.getElementById('quick-nav-verses'),
    floatingRefCapsule: document.getElementById('reader-floating-ref'),
    btnNavHome: document.getElementById('btn-nav-home'),
    btnNavChapters: document.getElementById('btn-nav-chapters'),
    btnNavVerse: document.getElementById('btn-nav-verse'),
    btnNavBookmarks: document.getElementById('btn-nav-bookmarks'),
    btnNavSearch: document.getElementById('btn-nav-search'),
    btnNavSettings: document.getElementById('btn-nav-settings'),
    
    // Drawers & Cohesive Screens
    screenBookmarks: document.getElementById('screen-bookmarks'),
    drawerBookmarks: document.getElementById('screen-bookmarks'),
    overlayBookmarks: null,
    bookmarksList: document.getElementById('bookmarks-list'),
    btnCloseBookmarks: null,

    screenSearch: document.getElementById('screen-search'),
    drawerSearch: document.getElementById('screen-search'),
    overlaySearch: null,
    btnCloseSearch: null,
    
    drawerStudyGuide: document.getElementById('drawer-study-guide'),
    overlayStudyGuide: document.getElementById('overlay-study-guide'),
    btnCloseStudyGuide: document.getElementById('btn-close-study-guide'),
    studyGuideList: document.getElementById('study-guide-list'),
    studyGuideTitle: document.getElementById('study-guide-title'),
    studyGuideDesc: document.getElementById('study-guide-desc'),
    
    drawerVerseDetail: document.getElementById('drawer-verse-detail'),
    overlayVerseDetail: document.getElementById('overlay-verse-detail'),
    btnCloseDetail: document.getElementById('btn-close-detail'),
    
    // Detail drawer contents
    detailRefText: document.getElementById('detail-ref-text'),
    detailSpeakerText: document.getElementById('detail-speaker-text'),
    detailSanskritText: document.getElementById('detail-sanskrit-text'),
    detailTranslitText: document.getElementById('detail-translit-text'),
    detailTranslationHiText: document.getElementById('detail-translation-hi-text'),
    detailTranslationEnText: document.getElementById('detail-translation-en-text'),
    detailWordsBody: document.getElementById('detail-words-body'),
    detailWordsSection: document.getElementById('detail-words-section'),
    detailCommentarySection: document.getElementById('detail-commentary-section'),
    selectCommentator: document.getElementById('select-commentator'),
    detailCommentaryTranslation: document.getElementById('detail-commentary-translation'),
    detailCommentaryText: document.getElementById('detail-commentary-text'),
    btnDetailBookmark: document.getElementById('btn-detail-bookmark'),
    btnDetailCopy: document.getElementById('btn-detail-copy'),
    
    // Global Settings Screen
    screenSettings: document.getElementById('screen-settings'),
    modalSettings: document.getElementById('screen-settings'),
    overlaySettings: null,
    btnCloseSettings: null,
    prefSa: document.getElementById('pref-sa'),
    prefTranslit: document.getElementById('pref-translit'),
    prefHi: document.getElementById('pref-hi'),
    prefEn: document.getElementById('pref-en'),
    btnScaleS: document.getElementById('btn-scale-s'),
    btnScaleM: document.getElementById('btn-scale-m'),
    btnScaleL: document.getElementById('btn-scale-l'),
    btnScaleXl: document.getElementById('btn-scale-xl'),
    
    toastContainer: document.getElementById('toast-container')
  };
}

// --------------------------------------------------------------------------
// Preferences & LocalStorage Handlers
// --------------------------------------------------------------------------
function loadPreferences() {
  // 1. Font Size
  const storedFont = localStorage.getItem('gita_pref_font_size');
  if (storedFont) {
    state.fontSize = storedFont;
  }
  updateFontSizeUI();

  // 2. Elements Toggles
  const storedElements = localStorage.getItem('gita_pref_elements');
  if (storedElements) {
    state.elements = JSON.parse(storedElements);
    const activeCount = ['sa', 'hi', 'en'].reduce((acc, curr) => acc + (state.elements[curr] ? 1 : 0), 0);
    if (activeCount === 0) {
      state.elements.sa = true;
    }
  }
  updateElementsUI();

  // 3. Bookmarks & Metadata
  const storedBookmarks = localStorage.getItem('gita_bookmarks');
  if (storedBookmarks) {
    state.bookmarks = JSON.parse(storedBookmarks);
  }
  const storedMeta = localStorage.getItem('gita_bookmark_reflections');
  if (storedMeta) {
    state.bookmarkMeta = JSON.parse(storedMeta);
  }

  // 4. Theme Preference
  const storedTheme = localStorage.getItem('gita_pref_theme');
  if (storedTheme) {
    state.theme = storedTheme;
  } else {
    state.theme = 'light';
  }
  applyThemeUI();
}

function savePreferences() {
  localStorage.setItem('gita_pref_font_size', state.fontSize);
  localStorage.setItem('gita_pref_elements', JSON.stringify(state.elements));
}

// --------------------------------------------------------------------------
// Minimal Theme Toggling Engine
// --------------------------------------------------------------------------
function applyThemeUI() {
  const isLight = state.theme === 'light';
  document.body.classList.toggle('light-theme', isLight);
  
  const btnThemeLight = document.getElementById('btn-theme-light');
  const btnThemeDark = document.getElementById('btn-theme-dark');
  
  if (btnThemeLight && btnThemeDark) {
    btnThemeLight.classList.toggle('active', isLight);
    btnThemeDark.classList.toggle('active', !isLight);
  }
}



function loadBookmarks() {
  const b = localStorage.getItem('gita_bookmarks');
  state.bookmarks = b ? JSON.parse(b) : [];
}

function saveBookmarks() {
  localStorage.setItem('gita_bookmarks', JSON.stringify(state.bookmarks));
  updateBookmarksUI();
}

function toggleBookmark(key) {
  const index = state.bookmarks.indexOf(key);
  let bookmarked = false;
  if (index === -1) {
    state.bookmarks.push(key);
    bookmarked = true;
    showToast(`श्लोक ${key} bookmarked successfully!`, "bookmark");
  } else {
    state.bookmarks.splice(index, 1);
    showToast(`Removed श्लोक ${key} from bookmarks.`, "info");
  }
  saveBookmarks();
  
  // Dynamic update of icon inside detail sheet if open
  if (state.activeVerse && `${state.activeVerse.chapter}.${state.activeVerse.verse}` === key) {
    updateDetailBookmarkIcon(bookmarked);
  }
  
  // Re-render reader to keep bookmark state icons updated in real-time
  if (state.screen === 'reader' && state.activeChapter) {
    const activeBtn = document.querySelector(`.verse-card[data-key="${key}"] .btn-bookmark`);
    if (activeBtn) {
      activeBtn.classList.toggle('active', bookmarked);
    }
  }
  
  // Re-render home chapters grid to show proper bookmark badges
  renderChapters();
}

function isBookmarked(key) {
  return state.bookmarks.includes(key);
}

// --------------------------------------------------------------------------
// Seeded Quote of the Day Engine (Changes exactly on calendar day change)
// --------------------------------------------------------------------------
function initQuoteOfTheDay() {
  const today = getCalendarDayString();
  const cachedQuote = localStorage.getItem('gita_quote_of_the_day');
  
  if (cachedQuote) {
    const quoteData = JSON.parse(cachedQuote);
    if (quoteData.date === today && GITA_DATA.verses[quoteData.verseKey]) {
      state.quoteOfTheDay = quoteData;
      renderQuoteCard();
      return;
    }
  }
  
  // Generate seeded quote of the day
  generateSeededQuote(today);
}

function getCalendarDayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

// Generate seeded random index from the calendar day string
function generateSeededQuote(dateStr) {
  // Simple custom string hash algorithm to generate a seed
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Map hash into the famous verses array length
  const index = Math.abs(hash) % FAMOUS_VERSES.length;
  const verseKey = FAMOUS_VERSES[index];
  
  state.quoteOfTheDay = {
    date: dateStr,
    verseKey: verseKey
  };
  
  localStorage.setItem('gita_quote_of_the_day', JSON.stringify(state.quoteOfTheDay));
  renderQuoteCard();
}

function forceShuffleQuote() {
  // Choose random verse from famous list that is different from current
  let randomKey = state.quoteOfTheDay.verseKey;
  while (randomKey === state.quoteOfTheDay.verseKey) {
    randomKey = FAMOUS_VERSES[Math.floor(Math.random() * FAMOUS_VERSES.length)];
  }
  
  state.quoteOfTheDay = {
    date: getCalendarDayString(),
    verseKey: randomKey
  };
  
  localStorage.setItem('gita_quote_of_the_day', JSON.stringify(state.quoteOfTheDay));
  renderQuoteCard();
  showToast("Revealed a new daily shloka!", "gold");
}

function renderQuoteCard() {
  const key = state.quoteOfTheDay.verseKey;
  const verse = GITA_DATA.verses[key];
  
  if (!verse) return;
  
  dom.quoteShloka.textContent = verse.slok;
  dom.quoteTranslationEn.textContent = verse.translation_en;
  dom.quoteRef.textContent = `— Chapter ${verse.chapter}, Verse ${verse.verse}`;

  // Sync to native Android home screen widget
  if (window.AndroidBridge && window.AndroidBridge.syncQuote) {
    try {
      window.AndroidBridge.syncQuote(verse.slok, verse.translation_en, `Chapter ${verse.chapter}, Verse ${verse.verse}`);
    } catch (e) {
      console.error("Widget quote sync failed:", e);
    }
  }
}

// --------------------------------------------------------------------------
// Navigation & Routing (Single Page routing via location hash)
// --------------------------------------------------------------------------
function navigateTo(screenName, chapterNum = null) {
  // Close any open overlay drawers automatically
  closeDrawer(dom.drawerStudyGuide);
  closeDrawer(dom.drawerVerseDetail);
  
  if (screenName === 'home') {
    location.hash = '';
  } else if (screenName === 'chapters') {
    location.hash = 'chapters';
  } else if (screenName === 'bookmarks') {
    location.hash = 'bookmarks';
  } else if (screenName === 'search') {
    location.hash = 'search';
  } else if (screenName === 'settings') {
    location.hash = 'settings';
  } else if (screenName === 'reader' && chapterNum) {
    location.hash = `chapter=${chapterNum}`;
  }
}

function handleHashRouting() {
  const hash = location.hash.replace('#', '');
  
  // Capture active reader context if transitioning away from the reader screen
  if (state.screen === 'reader' && state.activeChapter) {
    state.previousReaderChapter = state.activeChapter;
    state.previousReaderScrollKey = (state.lastReadPosition && state.lastReadPosition.chapter === state.activeChapter)
      ? state.lastReadPosition.key
      : `${state.activeChapter}.1`;
  }

  if (!hash) {
    state.screen = 'home';
    state.activeChapter = null;
    showScreenUI('home');
  } else if (hash === 'chapters') {
    state.screen = 'chapters';
    state.activeChapter = null;
    showScreenUI('chapters');
    renderChapters();
  } else if (hash === 'bookmarks') {
    state.screen = 'bookmarks';
    state.activeChapter = null;
    showScreenUI('bookmarks');
  } else if (hash === 'search') {
    state.screen = 'search';
    state.activeChapter = null;
    showScreenUI('search');
  } else if (hash === 'settings') {
    state.screen = 'settings';
    state.activeChapter = null;
    showScreenUI('settings');
  } else if (hash.startsWith('chapter=')) {
    const chNum = parseInt(hash.split('=')[1]);
    if (chNum >= 1 && chNum <= 18) {
      const isBackToSameChapter = (state.previousReaderChapter === chNum);
      const targetScrollKey = isBackToSameChapter ? state.previousReaderScrollKey : null;

      state.screen = 'reader';
      state.activeChapter = chNum;
      showScreenUI('reader');
      renderReader(chNum);

      if (targetScrollKey) {
        setTimeout(() => {
          const card = document.querySelector(`.verse-card[data-key="${targetScrollKey}"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'instant', block: 'center' });
            card.classList.remove('verse-highlight-flash');
            void card.offsetWidth; // Force reflow
            card.classList.add('verse-highlight-flash');
          }
        }, 400);
      }
    } else {
      navigateTo('home');
    }
  } else {
    navigateTo('home');
  }
}

function openQuickNavTab(tabName) {
  if (!dom.panelQuickNav) return;
  if (!dom.panelQuickNav.classList.contains('open')) {
    openQuickNav();
  }
}

function updateNavTabGlow() {
  if (dom.btnNavHome) dom.btnNavHome.classList.remove('active');
  if (dom.btnNavChapters) dom.btnNavChapters.classList.remove('active');
  if (dom.btnNavBookmarks) dom.btnNavBookmarks.classList.remove('active');
  if (dom.btnNavSearch) dom.btnNavSearch.classList.remove('active');
  if (dom.btnNavSettings) dom.btnNavSettings.classList.remove('active');

  if (state.screen === 'home') {
    if (dom.btnNavHome) dom.btnNavHome.classList.add('active');
  } else if (state.screen === 'chapters') {
    if (dom.btnNavChapters) dom.btnNavChapters.classList.add('active');
  } else if (state.screen === 'bookmarks') {
    if (dom.btnNavBookmarks) dom.btnNavBookmarks.classList.add('active');
  } else if (state.screen === 'search') {
    if (dom.btnNavSearch) dom.btnNavSearch.classList.add('active');
  } else if (state.screen === 'settings') {
    if (dom.btnNavSettings) dom.btnNavSettings.classList.add('active');
  }
}

function showScreenUI(screenName) {
  window.scrollTo({ top: 0, behavior: 'instant' });
  
  // Close quick nav popup dynamically upon screen change
  closeQuickNav();
  
  // All screens
  const allScreens = [
    { name: 'home', dom: dom.screenHome },
    { name: 'chapters', dom: dom.screenChapters },
    { name: 'reader', dom: dom.screenReader },
    { name: 'bookmarks', dom: dom.screenBookmarks },
    { name: 'search', dom: dom.screenSearch },
    { name: 'settings', dom: dom.screenSettings }
  ];

  // Set active screens and handle transition
  allScreens.forEach(scr => {
    if (scr.dom) {
      scr.dom.classList.remove('active');
    }
  });

  // Handle specific elements per screen
  if (screenName === 'home') {
    hideProgressUI();
    renderChapters(); // Force re-render of chapter progress badges on returning home
    initContinueReading();
    if (typeof renderHeatmap === 'function') {
      renderHeatmap();
    }
    if (dom.readerQuickNav) {
      dom.readerQuickNav.style.display = 'flex';
    }
    if (dom.floatingRefCapsule) {
      dom.floatingRefCapsule.classList.remove('active');
      setTimeout(() => {
        if (state.screen === 'home' || state.screen === 'chapters' || state.screen === 'bookmarks' || state.screen === 'search' || state.screen === 'settings') {
          dom.floatingRefCapsule.style.display = 'none';
        }
      }, 300);
    }
  } else if (screenName === 'chapters') {
    hideProgressUI();
    if (dom.readerQuickNav) {
      dom.readerQuickNav.style.display = 'flex';
    }
    if (dom.floatingRefCapsule) {
      dom.floatingRefCapsule.classList.remove('active');
      setTimeout(() => {
        if (state.screen === 'home' || state.screen === 'chapters' || state.screen === 'bookmarks' || state.screen === 'search' || state.screen === 'settings') {
          dom.floatingRefCapsule.style.display = 'none';
        }
      }, 300);
    }
  } else if (screenName === 'bookmarks') {
    hideProgressUI();
    renderBookmarks();
    if (dom.readerQuickNav) {
      dom.readerQuickNav.style.display = 'flex';
    }
    if (dom.floatingRefCapsule) {
      dom.floatingRefCapsule.classList.remove('active');
      setTimeout(() => {
        if (state.screen === 'home' || state.screen === 'chapters' || state.screen === 'bookmarks' || state.screen === 'search' || state.screen === 'settings') {
          dom.floatingRefCapsule.style.display = 'none';
        }
      }, 300);
    }
  } else if (screenName === 'search') {
    hideProgressUI();
    if (dom.readerQuickNav) {
      dom.readerQuickNav.style.display = 'flex';
    }
    if (dom.floatingRefCapsule) {
      dom.floatingRefCapsule.classList.remove('active');
      setTimeout(() => {
        if (state.screen === 'home' || state.screen === 'chapters' || state.screen === 'bookmarks' || state.screen === 'search' || state.screen === 'settings') {
          dom.floatingRefCapsule.style.display = 'none';
        }
      }, 300);
    }
    setTimeout(() => {
      if (dom.inputSearch) dom.inputSearch.focus();
    }, 400);
  } else if (screenName === 'settings') {
    hideProgressUI();
    if (dom.readerQuickNav) {
      dom.readerQuickNav.style.display = 'flex';
    }
    if (dom.floatingRefCapsule) {
      dom.floatingRefCapsule.classList.remove('active');
      setTimeout(() => {
        if (state.screen === 'home' || state.screen === 'chapters' || state.screen === 'bookmarks' || state.screen === 'search' || state.screen === 'settings') {
          dom.floatingRefCapsule.style.display = 'none';
        }
      }, 300);
    }
  } else {
    // reader view
    if (dom.readerQuickNav) {
      dom.readerQuickNav.style.display = 'flex';
    }
    if (dom.floatingRefCapsule) {
      dom.floatingRefCapsule.style.display = 'block';
      setTimeout(() => dom.floatingRefCapsule.classList.add('active'), 10);
    }
  }

  // Swap displays smoothly
  setTimeout(() => {
    allScreens.forEach(scr => {
      if (scr.dom) {
        if (scr.name === screenName) {
          scr.dom.style.display = 'block';
          setTimeout(() => scr.dom.classList.add('active'), 50);
        } else {
          scr.dom.style.display = 'none';
        }
      }
    });
    updateNavTabGlow();
  }, 300);
}

// --------------------------------------------------------------------------
// UI Rendering - Chapters
// --------------------------------------------------------------------------
function renderChapters() {
  dom.chaptersGrid.innerHTML = '';
  
  // Render Resume Reading button at the top of chapters grid if last read position exists
  const resumeContainer = document.getElementById('chapters-resume-container');
  if (resumeContainer) {
    const pos = state.lastReadPosition || JSON.parse(localStorage.getItem('gita_last_read_position'));
    if (pos && pos.key && !pos.isFirstLaunch) {
      resumeContainer.style.display = 'block';
      resumeContainer.innerHTML = `
        <button class="resume-reading-btn glass" id="btn-chapters-resume" style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 20px; border-radius: var(--border-radius-md); border: 1px solid var(--glass-border); background: var(--saffron-light); color: var(--text-primary); font-family: var(--font-sans); cursor: pointer; outline: none; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px; text-align: left;">
            <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: var(--gold); flex-shrink: 0;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--gold); letter-spacing: 1.5px; text-transform: uppercase; margin: 0;">Continue Reading • पठन जारी रखें</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Chapter ${pos.chapter}, Verse ${pos.verse} • अध्याय ${pos.chapter}, श्लोक ${pos.verse}</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: var(--text-secondary);"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </button>
      `;
      const btnChaptersResume = document.getElementById('btn-chapters-resume');
      if (btnChaptersResume) {
        btnChaptersResume.onclick = (e) => {
          e.stopPropagation();
          navigateTo('reader', pos.chapter);
          setTimeout(() => {
            const card = document.querySelector(`.verse-card[data-key="${pos.key}"]`);
            if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              card.classList.remove('verse-highlight-flash');
              void card.offsetWidth; // Force reflow
              card.classList.add('verse-highlight-flash');
            }
          }, 400);
        };
      }
    } else {
      resumeContainer.style.display = 'none';
      resumeContainer.innerHTML = '';
    }
  }

  // Read chapter progress map from local storage
  const chProgressMap = JSON.parse(localStorage.getItem('gita_chapter_progress') || '{}');
  
  GITA_DATA.chapters.forEach(ch => {
    const card = document.createElement('div');
    card.className = 'chapter-card glass-glow';
    
    // Check if any verse in this chapter is bookmarked
    const chapterBookmarks = state.bookmarks.filter(k => k.startsWith(`${ch.chapter_number}.`));
    const badgeHTML = chapterBookmarks.length > 0 
      ? `<span class="ch-badge">${chapterBookmarks.length} saved</span>`
      : '';
      
    // Read completion percentage from cache
    const percent = chProgressMap[ch.chapter_number] || 0;
    let progressBadgeHTML = '';
    if (percent === 100) {
      progressBadgeHTML = `<span class="ch-progress-badge completed"><svg viewBox="0 0 24 24" style="width:10px;height:10px;fill:currentColor;margin-right:2px;display:inline-block;vertical-align:middle;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>100% Completed</span>`;
    } else if (percent > 0) {
      progressBadgeHTML = `<span class="ch-progress-badge started">${percent}% Completed</span>`;
    } else {
      progressBadgeHTML = `<span class="ch-progress-badge not-started">Not Started</span>`;
    }
      
    card.innerHTML = `
      <div class="card-bg-glow"></div>
      <div class="chapter-card-header">
        <span class="ch-number">अध्याय ${romanize(ch.chapter_number)} • CH ${ch.chapter_number}</span>
        <span class="ch-verse-count">${ch.verses_count} Verses</span>
      </div>
      <h3 class="ch-name-sa sanskrit text-glow">${ch.name}</h3>
      <h4 class="ch-name-translit">${ch.transliteration}</h4>
      <p class="ch-meaning">${ch.meaning_en}</p>
      <div class="ch-card-footer">
        <span class="ch-action-text">Read Chapter <svg class="icon-small" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></span>
        <div class="ch-badges-container" style="display: flex; gap: 8px; align-items: center;">
          ${progressBadgeHTML}
          ${badgeHTML}
        </div>
      </div>
    `;
    
    card.addEventListener('click', () => {
      navigateTo('reader', ch.chapter_number);
    });
    
    dom.chaptersGrid.appendChild(card);
  });
}

// --------------------------------------------------------------------------
// UI Rendering - Chapter Reader
// --------------------------------------------------------------------------
function renderReader(chapterNum) {
  const chData = GITA_DATA.chapters[chapterNum - 1];
  if (!chData) return;
  
  // 1. Update Chapter Banner Metadata
  dom.readerChNum.textContent = `अध्याय ${romanize(chapterNum)} • CHAPTER ${chapterNum}`;
  dom.readerChTitle.textContent = chData.name;
  dom.readerChMeaning.textContent = chData.meaning_en;
  dom.readerChVerses.textContent = `${chData.verses_count} Verses`;
  
  // Initialize progress badge from local storage
  const chProgressMap = JSON.parse(localStorage.getItem('gita_chapter_progress') || '{}');
  const percent = parseInt(chProgressMap[String(chapterNum)]) || 0;
  const progressBadge = document.getElementById('reader-ch-progress');
  if (progressBadge) {
    progressBadge.textContent = `${percent}% Completed`;
    progressBadge.style.display = 'inline-block';
  }

  // Initialize bottom navigation pill immediately to prevent old/Hindi text layout flashing
  const pos = JSON.parse(localStorage.getItem('gita_last_read_position'));
  const startVerse = (pos && pos.chapter === chapterNum) ? pos.verse : 1;
  updateNavigationPillText(chapterNum, startVerse);
  
  // 2. Clear & Render Verses
  dom.versesListContainer.innerHTML = '';
  
  // Filter and sort verses for this chapter
  const chapterVerses = Object.values(GITA_DATA.verses)
    .filter(v => v.chapter === chapterNum)
    .sort((a, b) => a.verse - b.verse);
    
  chapterVerses.forEach(v => {
    const vKey = `${v.chapter}.${v.verse}`;
    const card = document.createElement('div');
    card.className = 'verse-card glass';
    card.setAttribute('data-key', vKey);
    
    const isBooked = isBookmarked(vKey);
    
    card.innerHTML = `
      <div class="verse-card-header">
        <span class="verse-badge">श्लोक ${v.chapter}.${v.verse}</span>
        <div class="verse-actions-bar">
          <button class="verse-card-btn btn-copy" title="Copy to Clipboard">
            <svg class="icon-small" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          </button>
          <button class="verse-card-btn btn-speak speak-btn" title="Recite Shloka">
            <svg class="icon-small" viewBox="0 0 24 24" style="width:16px;height:16px;fill:currentColor;"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          </button>
          <button class="verse-card-btn btn-bookmark ${isBooked ? 'active' : ''}" title="Bookmark Verse">
            <svg class="icon-small" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>
          </button>
        </div>
      </div>
      <div class="verse-text-block">
        <p class="verse-shloka sanskrit text-glow">${v.slok}</p>
        <p class="verse-translation-hi">${v.translation_hi}</p>
        <p class="verse-translation-en">${v.translation_en}</p>
      </div>
      <div class="verse-card-arrow" title="Expand Details">
        <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
      </div>
    `;
    
    // Click actions
    const btnBookmark = card.querySelector('.btn-bookmark');
    btnBookmark.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBookmark(vKey);
      btnBookmark.blur();
    });
    
    const btnSpeak = card.querySelector('.btn-speak');
    btnSpeak.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleRecitation(v.slok, btnSpeak);
      btnSpeak.blur();
    });
    
    const btnCopy = card.querySelector('.btn-copy');
    btnCopy.addEventListener('click', (e) => {
      e.stopPropagation();
      copyVerseToClipboard(v, btnCopy);
      btnCopy.blur();
    });
    
    // Tap anywhere on card to open detail view drawer
    card.addEventListener('click', () => {
      openVerseDetail(vKey);
    });
    
    // Setup long-press listener for hold-to-copy
    setupLongPressListener(card, v);
    
    dom.versesListContainer.appendChild(card);
  });
  
  // Refresh Controls visibility toggles based on preferences
  updateElementsUI();
}

// --------------------------------------------------------------------------
// Long Press Hold-to-Copy Setup
// --------------------------------------------------------------------------
function setupLongPressListener(element, verse) {
  let pressTimer = null;
  const holdDuration = 600; // time in ms for long-press
  
  const startPress = (e) => {
    // Only capture primary mouse clicks or touches
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    pressTimer = setTimeout(() => {
      // Hold completed successfully! Copy to clipboard
      copyVerseToClipboard(verse, null, true);
    }, holdDuration);
  };
  
  const cancelPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };
  
  // Mouse events
  element.addEventListener('mousedown', startPress);
  element.addEventListener('mouseup', cancelPress);
  element.addEventListener('mouseleave', cancelPress);
  
  // Touch events (for mobile devices)
  element.addEventListener('touchstart', startPress, { passive: true });
  element.addEventListener('touchend', cancelPress);
  element.addEventListener('touchcancel', cancelPress);
}

// --------------------------------------------------------------------------
// Clipboard & Toast Notification Systems
// --------------------------------------------------------------------------
function copyVerseToClipboard(verse, buttonEl = null, isLongPress = false) {
  const ref = `(Bhagavad Gita Chapter ${verse.chapter}, Verse ${verse.verse})`;
  
  // Compile structured text
  const clipboardText = `${verse.slok}\n\nTransliteration:\n${verse.transliteration}\n\nहिंदी अनुवाद:\n${verse.translation_hi}\n\nEnglish Translation:\n${verse.translation_en}\n\n${ref}`;
  
  navigator.clipboard.writeText(clipboardText).then(() => {
    // visual button feedback
    if (buttonEl) {
      buttonEl.classList.add('copy-feedback');
      const origSVG = buttonEl.innerHTML;
      buttonEl.innerHTML = `<svg class="icon-small" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
      setTimeout(() => {
        buttonEl.classList.remove('copy-feedback');
        buttonEl.innerHTML = origSVG;
      }, 1500);
    }
    
    const triggerType = isLongPress ? "Hold-to-Copy" : "Copy";
    showToast(`Copied Verse ${verse.chapter}.${verse.verse} directly to clipboard!`, "copy");
  }).catch(err => {
    console.error("Could not copy shloka to clipboard: ", err);
    showToast("Copy to clipboard failed. Check browser permissions.", "info");
  });
}

function showToast(message, type = "info") {
  const toast = document.createElement('div');
  toast.className = 'toast glass';
  
  let iconHTML = '';
  if (type === 'bookmark') {
    iconHTML = `<svg class="toast-icon" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>`;
  } else if (type === 'copy') {
    iconHTML = `<svg class="toast-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
  } else {
    iconHTML = `<svg class="toast-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
  }
  
  toast.innerHTML = `
    ${iconHTML}
    <span>${message}</span>
  `;
  
  dom.toastContainer.appendChild(toast);
  
  // Smooth exit animation trigger
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

// --------------------------------------------------------------------------
// Drawer Open/Close Logic
// --------------------------------------------------------------------------
function openDrawer(drawerEl) {
  drawerEl.classList.add('open');
  document.body.style.overflow = 'hidden'; // Lock main scroll
  
  const scrollContainer = drawerEl.querySelector('.drawer-body');
  if (scrollContainer) {
    scrollContainer.scrollTop = 0;
  }
  
  // Reset any swipe transition translations on open
  const content = drawerEl.querySelector('.drawer-content');
  if (content) {
    content.style.transform = '';
    content.style.transition = '';
  }
  updateNavTabGlow();
}

function closeDrawer(drawerEl) {
  drawerEl.classList.remove('open');
  document.body.style.overflow = ''; // Unlock scroll
  
  // Hide global progress line if we are on home screen
  if (state.screen === 'home') {
    hideProgressUI();
  }
  updateNavTabGlow();
}

function openModal(modalEl) {
  modalEl.classList.add('open');
  document.body.style.overflow = 'hidden';
  updateNavTabGlow();
}

function closeModal(modalEl) {
  modalEl.classList.remove('open');
  document.body.style.overflow = '';
  updateNavTabGlow();
}

// --------------------------------------------------------------------------
// UI Rendering - Verse Detail Bottom Sheet
// --------------------------------------------------------------------------
function openVerseDetail(key) {
  const v = GITA_DATA.verses[key];
  if (!v) return;
  
  state.activeVerse = v;
  
  // 1. Populate text fields
  dom.detailRefText.textContent = `अध्याय ${v.chapter}, श्लोक ${v.verse} • CHAPTER ${v.chapter}, VERSE ${v.verse}`;
  dom.detailSpeakerText.textContent = v.speaker ? `Speaker: ${v.speaker}` : '';
  dom.detailSanskritText.textContent = v.slok;
  dom.detailTranslitText.textContent = v.transliteration;
  dom.detailTranslationHiText.textContent = v.translation_hi;
  dom.detailTranslationEnText.textContent = v.translation_en;
  
  // 2. Populate word meanings table
  dom.detailWordsBody.innerHTML = '';
  if (v.word_meanings && v.word_meanings.length > 0) {
    dom.detailWordsSection.style.display = 'block';
    v.word_meanings.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.word}</td>
        <td>${item.meaning}</td>
      `;
      dom.detailWordsBody.appendChild(row);
    });
  } else {
    // Hide word meanings section if not available
    dom.detailWordsSection.style.display = 'none';
  }
  
  // 2.5. Populate commentaries
  updateCommentaryDisplay();
  
  // 3. Setup Detail action buttons
  updateDetailBookmarkIcon(isBookmarked(key));
  
  openDrawer(dom.drawerVerseDetail);
}

function updateCommentaryDisplay() {
  if (!state.activeVerse) return;
  
  const v = state.activeVerse;
  
  if (!v.commentaries || Object.keys(v.commentaries).length === 0) {
    if (dom.detailCommentarySection) dom.detailCommentarySection.style.display = 'none';
    return;
  }
  
  if (dom.detailCommentarySection) dom.detailCommentarySection.style.display = 'block';
  
  const authorKey = dom.selectCommentator ? dom.selectCommentator.value : 'siva';
  const commentary = v.commentaries[authorKey];
  
  if (commentary) {
    // 1. Translation block
    if (dom.detailCommentaryTranslation) {
      if (commentary.translation) {
        dom.detailCommentaryTranslation.style.display = 'block';
        dom.detailCommentaryTranslation.textContent = commentary.translation;
      } else {
        dom.detailCommentaryTranslation.style.display = 'none';
      }
    }
    
    // 2. Commentary body block
    if (dom.detailCommentaryText) {
      if (commentary.commentary) {
        dom.detailCommentaryText.style.display = 'block';
        
        let formattedText = commentary.commentary;
        
        // Match Devanagari Sanskrit sequences (Unicode range: \u0900-\u097F)
        const devanagariRegex = /([\u0900-\u097F]+(?:[\s\u0900-\u097F,.:;|।\d]*[\u0900-\u097F])?)/g;
        
        const paragraphs = formattedText.split('\n').map(p => {
          const cleaned = p.trim();
          if (!cleaned) return '';
          
          // Pure Sanskrit lines (like shloka/citation lines in Shankara commentary)
          const isSanskritPure = /^[\u0900-\u097F\s\d|।,.:;?"'!()\[\]{}–—\-\u2013\u2014]+$/.test(cleaned) && cleaned.length > 5;
          if (isSanskritPure) {
            return `<p><span class="sanskrit-citation">${cleaned}</span></p>`;
          }
          
          // Inline highlighting
          const processed = cleaned.replace(devanagariRegex, '<span class="sanskrit-citation">$1</span>');
          return `<p>${processed}</p>`;
        }).filter(Boolean).join('');
        
        dom.detailCommentaryText.innerHTML = paragraphs;
      } else {
        dom.detailCommentaryText.style.display = 'none';
      }
    }
  } else {
    if (dom.detailCommentaryTranslation) dom.detailCommentaryTranslation.style.display = 'none';
    if (dom.detailCommentaryText) {
      dom.detailCommentaryText.style.display = 'block';
      dom.detailCommentaryText.innerHTML = '<p class="text-muted" style="text-align:center;">Commentary not available for this scholar.</p>';
    }
  }
}

function updateDetailBookmarkIcon(bookmarked) {
  if (bookmarked) {
    dom.btnDetailBookmark.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>`;
    dom.btnDetailBookmark.classList.add('active');
  } else {
    dom.btnDetailBookmark.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>`;
    dom.btnDetailBookmark.classList.remove('active');
  }
}

// --------------------------------------------------------------------------
// UI Rendering - Bookmarks list
// --------------------------------------------------------------------------
function renderBookmarks() {
  dom.bookmarksList.innerHTML = '';
  
  if (state.bookmarks.length === 0) {
    dom.bookmarksList.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>
        <p>No bookmarked verses yet.</p>
        <span>Hold down or click bookmark on any verse to save it for quick offline reading!</span>
      </div>
    `;
    return;
  }
  
  // Sort bookmarks numerically
  const sorted = [...state.bookmarks].sort((a, b) => {
    const aParts = a.split('.');
    const bParts = b.split('.');
    return aParts[0] - bParts[0] || aParts[1] - bParts[1];
  });

  // Get active query and active tag filter
  const query = document.getElementById('bookmarks-search')?.value.toLowerCase().trim() || "";
  const activeTag = document.querySelector('.filter-tag.active')?.getAttribute('data-tag') || 'all';

  let filteredKeys = sorted;

  // 1. Tag Filtering
  if (activeTag !== 'all') {
    filteredKeys = filteredKeys.filter(key => {
      const meta = state.bookmarkMeta[key];
      if (!meta) return false;
      if (activeTag === 'notes') {
        return meta.notes && meta.notes.trim().length > 0;
      }
      return Array.isArray(meta.tags) && meta.tags.includes(activeTag);
    });
  }

  // 2. Search Text Filtering
  if (query.length > 0) {
    filteredKeys = filteredKeys.filter(key => {
      const v = GITA_DATA.verses[key];
      if (!v) return false;
      const notes = (state.bookmarkMeta[key]?.notes || "").toLowerCase();
      const slok = v.slok.toLowerCase();
      const trans = v.translation_en.toLowerCase();
      return slok.includes(query) || trans.includes(query) || notes.includes(query) || key.includes(query);
    });
  }

  if (filteredKeys.length === 0) {
    dom.bookmarksList.innerHTML = `
      <div class="empty-state" style="padding: 40px 20px;">
        <svg class="empty-icon" viewBox="0 0 24 24" style="opacity:0.3;"><path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.57 4.23l.28.27h.79l5 4.99L19 20.49l-4.99-5v-.79l-.27-.28A6.5 6.5 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/></svg>
        <p>No matching diary entries found.</p>
        <span>Refine your tag filter or search keyword to find bookmarked reflections!</span>
      </div>
    `;
    return;
  }
  
  filteredKeys.forEach(key => {
    const v = GITA_DATA.verses[key];
    if (!v) return;
    
    const item = document.createElement('div');
    item.className = 'bookmark-item glass';
    item.setAttribute('data-key', key);
    
    const notesText = (state.bookmarkMeta[key] && state.bookmarkMeta[key].notes) || "";
    
    const hasTag = (t) => {
      if (state.bookmarkMeta[key] && Array.isArray(state.bookmarkMeta[key].tags)) {
        return state.bookmarkMeta[key].tags.includes(t);
      }
      return false;
    };
    
    item.innerHTML = `
      <div class="bookmark-item-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" class="bookmark-select-checkbox" data-key="${key}" checked />
          <span class="bookmark-ref">अध्याय ${v.chapter}, श्लोक ${v.verse}</span>
        </div>
        <button class="btn-remove-bookmark" title="Remove Bookmark">
          <svg class="icon-small" viewBox="0 0 24 24" style="width:18px;height:18px;fill:currentColor;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
      <p class="bookmark-full-slok sanskrit">${v.slok}</p>
      <p class="bookmark-full-trans">${v.translation_en}</p>
      
      <!-- Reflections and Notes Section -->
      <div class="bookmark-notes-section">
        <div class="bookmark-notes-header">
          <span class="bookmark-notes-label">Reflections & Notes</span>
        </div>
        <textarea class="bookmark-notes-input" placeholder="Write your personal thoughts or study notes on this verse...">${notesText}</textarea>
        <button class="bookmark-notes-save-btn">Save Note</button>
      </div>
      
      <!-- Preset Tags Section -->
      <div class="bookmark-tags-section">
        <span class="tag-selector-title">Categorize Tags</span>
        <div class="tag-pill-group">
          <span class="tag-pill ${hasTag('Wisdom') ? 'active wisdom' : ''}" data-tag="Wisdom">Wisdom</span>
          <span class="tag-pill ${hasTag('Devotion') ? 'active devotion' : ''}" data-tag="Devotion">Devotion</span>
          <span class="tag-pill ${hasTag('Duty') ? 'active duty' : ''}" data-tag="Duty">Duty</span>
          <span class="tag-pill ${hasTag('Peace') ? 'active peace' : ''}" data-tag="Peace">Peace</span>
        </div>
      </div>

      <button class="bookmark-card-jump-btn">
        <span>Jump to Verse</span>
        <svg class="icon-small" viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
      </button>
    `;
    
    // Toggle card expansion (excluding interactive sub-elements)
    item.addEventListener('click', (e) => {
      if (e.target.closest('textarea') || e.target.closest('button') || e.target.closest('.tag-pill') || e.target.closest('.bookmark-select-checkbox')) {
        return;
      }
      item.classList.toggle('expanded');
    });

    // Checkbox change listener
    const checkbox = item.querySelector('.bookmark-select-checkbox');
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        updateSelectedCount();
      });
    }

    // Jump to Verse Handler
    const jumpBtn = item.querySelector('.bookmark-card-jump-btn');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateTo('reader', v.chapter);
        // Wait for reader screen slide then flash card
        setTimeout(() => {
          const card = document.querySelector(`.verse-card[data-key="${key}"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.remove('verse-highlight-flash');
            void card.offsetWidth; // Force reflow
            card.classList.add('verse-highlight-flash');
          }
        }, 400);
      });
    }
    
    // Save Reflections & Notes Handler
    const saveBtn = item.querySelector('.bookmark-notes-save-btn');
    const textarea = item.querySelector('.bookmark-notes-input');
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const noteVal = textarea.value.trim();
      if (!state.bookmarkMeta[key]) {
        state.bookmarkMeta[key] = { notes: "", tags: [] };
      }
      state.bookmarkMeta[key].notes = noteVal;
      localStorage.setItem('gita_bookmark_reflections', JSON.stringify(state.bookmarkMeta));
      showToast(`Notes saved for Verse ${key}!`, "copy");
    });
    
    // Preset Tags Toggle Handler
    const tagPills = item.querySelectorAll('.tag-pill');
    tagPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = pill.getAttribute('data-tag');
        if (!state.bookmarkMeta[key]) {
          state.bookmarkMeta[key] = { notes: "", tags: [] };
        }
        if (!Array.isArray(state.bookmarkMeta[key].tags)) {
          state.bookmarkMeta[key].tags = [];
        }
        
        const idx = state.bookmarkMeta[key].tags.indexOf(tag);
        if (idx === -1) {
          state.bookmarkMeta[key].tags.push(tag);
          pill.classList.add('active', tag.toLowerCase());
          showToast(`Added tag: ${tag}`, "info");
        } else {
          state.bookmarkMeta[key].tags.splice(idx, 1);
          pill.classList.remove('active', tag.toLowerCase());
          showToast(`Removed tag: ${tag}`, "info");
        }
        localStorage.setItem('gita_bookmark_reflections', JSON.stringify(state.bookmarkMeta));
      });
    });
    
    // Remove Bookmark Handler
    const btnRemove = item.querySelector('.btn-remove-bookmark');
    btnRemove.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBookmark(key);
      renderBookmarks();
    });
    
    dom.bookmarksList.appendChild(item);
  });
  updateSelectedCount();
}

function updateBookmarksUI() {
  // Numeric notification badge removed to respect user's OCD
  if (dom.bookmarkBadge) {
    dom.bookmarkBadge.style.display = 'none';
  }
}

// --------------------------------------------------------------------------
// Preferences Toggles & Styling updates
// --------------------------------------------------------------------------
function updateFontSizeUI() {
  if (dom.fontSizeLabel) {
    dom.fontSizeLabel.textContent = state.fontSize === 'small' ? '14px' :
                                    state.fontSize === 'medium' ? '16px' :
                                    state.fontSize === 'large' ? '18px' : '20px';
  }
                                  
  // Update control grid in settings panel
  [dom.btnScaleS, dom.btnScaleM, dom.btnScaleL, dom.btnScaleXl].forEach(btn => {
    if (btn) btn.classList.remove('active');
  });
  
  if (state.fontSize === 'small' && dom.btnScaleS) dom.btnScaleS.classList.add('active');
  if (state.fontSize === 'medium' && dom.btnScaleM) dom.btnScaleM.classList.add('active');
  if (state.fontSize === 'large' && dom.btnScaleL) dom.btnScaleL.classList.add('active');
  if (state.fontSize === 'xlarge' && dom.btnScaleXl) dom.btnScaleXl.classList.add('active');
  
  // Set reader parent layout classes
  if (dom.versesListContainer) {
    dom.versesListContainer.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-xlarge');
    dom.versesListContainer.classList.add(`font-size-${state.fontSize}`);
  }

  // Set root font size variable for global application scaling
  const rootPixelVal = state.fontSize === 'small' ? '14px' :
                       state.fontSize === 'medium' ? '16px' :
                       state.fontSize === 'large' ? '18px' : '20px';
  document.documentElement.style.setProperty('--font-scale', rootPixelVal);
}

function updateElementsUI() {
  // Update toggle buttons active states in Reader settings bar
  toggleBtnState(dom.toggleSa, state.elements.sa);
  toggleBtnState(dom.toggleTranslit, state.elements.translit);
  toggleBtnState(dom.toggleHi, state.elements.hi);
  toggleBtnState(dom.toggleEn, state.elements.en);
  
  // Update inline header toggles active state
  toggleBtnState(dom.inlineToggleSa, state.elements.sa);
  toggleBtnState(dom.inlineToggleHi, state.elements.hi);
  toggleBtnState(dom.inlineToggleEn, state.elements.en);
  
  // Update checkboxes in global settings modal
  if (dom.prefSa) dom.prefSa.checked = state.elements.sa;
  if (dom.prefTranslit) dom.prefTranslit.checked = state.elements.translit;
  if (dom.prefHi) dom.prefHi.checked = state.elements.hi;
  if (dom.prefEn) dom.prefEn.checked = state.elements.en;

  // Add/remove hide classes on verses container
  if (dom.versesListContainer) {
    dom.versesListContainer.classList.toggle('hide-sa', !state.elements.sa);
    dom.versesListContainer.classList.toggle('hide-translit', !state.elements.translit);
    dom.versesListContainer.classList.toggle('hide-hi', !state.elements.hi);
    dom.versesListContainer.classList.toggle('hide-en', !state.elements.en);
  }
}

function toggleBtnState(btnEl, active) {
  if (btnEl) {
    btnEl.classList.toggle('active', active);
  }
}

function adjustFontSize(increment = true) {
  const sizes = ['small', 'medium', 'large', 'xlarge'];
  let idx = sizes.indexOf(state.fontSize);
  
  if (increment && idx < sizes.length - 1) {
    idx++;
  } else if (!increment && idx > 0) {
    idx--;
  }
  
  state.fontSize = sizes[idx];
  savePreferences();
  updateFontSizeUI();
}

// --------------------------------------------------------------------------
// Event Listeners Initialization
// --------------------------------------------------------------------------
function initEventListeners() {
  // 1. Header & Navigation Taps
  dom.btnHeaderHome.addEventListener('click', () => navigateTo('home'));
  dom.btnReaderBack.addEventListener('click', () => navigateTo('chapters'));

  // Bind Explore Chapters prompt card in dashboard
  const btnHomeExploreChapters = document.getElementById('btn-home-explore-chapters');
  if (btnHomeExploreChapters) {
    btnHomeExploreChapters.addEventListener('click', () => navigateTo('chapters'));
  }

  // Bind Header Streak Badge and detailed analytics bottom slidesheet triggers
  const btnHeaderStreak = document.getElementById('btn-header-streak');
  const drawerStreakAnalytics = document.getElementById('drawer-streak-analytics');
  const btnCloseStreakAnalytics = document.getElementById('btn-close-streak-analytics');
  const overlayStreakAnalytics = document.getElementById('overlay-streak-analytics');

  if (btnHeaderStreak && drawerStreakAnalytics) {
    btnHeaderStreak.addEventListener('click', (e) => {
      e.stopPropagation();
      openDrawer(drawerStreakAnalytics);
      renderHeatmap(); // Freshly render heatmap contributions
    });
  }
  if (btnCloseStreakAnalytics && drawerStreakAnalytics) {
    btnCloseStreakAnalytics.addEventListener('click', () => closeDrawer(drawerStreakAnalytics));
  }
  if (overlayStreakAnalytics && drawerStreakAnalytics) {
    overlayStreakAnalytics.addEventListener('click', () => closeDrawer(drawerStreakAnalytics));
  }
  
  // 2. Bookmarks Screen / Study Guide Drawer
  if (dom.btnToggleBookmarks) {
    dom.btnToggleBookmarks.addEventListener('click', () => {
      navigateTo('bookmarks');
    });
  }
  
  // 2.5. Study Guide Curated Drawer toggling
  if (dom.btnCloseStudyGuide) dom.btnCloseStudyGuide.addEventListener('click', () => closeDrawer(dom.drawerStudyGuide));
  if (dom.overlayStudyGuide) dom.overlayStudyGuide.addEventListener('click', () => closeDrawer(dom.drawerStudyGuide));
  
  // 3. Settings Screen triggers
  if (dom.btnToggleSettings) {
    dom.btnToggleSettings.addEventListener('click', () => {
      navigateTo('settings');
    });
  }
  
  // 4. Quote of the Day read button
  dom.btnQuoteView.addEventListener('click', () => {
    openVerseDetail(state.quoteOfTheDay.verseKey);
  });
  dom.btnRefreshQuote.addEventListener('click', forceShuffleQuote);
  
  // 5. Reader settings bar font adjustment triggers
  if (dom.btnFontDec) dom.btnFontDec.addEventListener('click', () => adjustFontSize(false));
  if (dom.btnFontInc) dom.btnFontInc.addEventListener('click', () => adjustFontSize(true));
  
  // 6. Reader settings bar toggles
  [dom.toggleSa, dom.toggleTranslit, dom.toggleHi, dom.toggleEn].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-element');
      if (['sa', 'hi', 'en'].includes(type) && state.elements[type]) {
        const activeCount = ['sa', 'hi', 'en'].reduce((acc, curr) => acc + (state.elements[curr] ? 1 : 0), 0);
        if (activeCount <= 1) {
          showToast("At least one reading option must remain active!", "info");
          return;
        }
      }
      state.elements[type] = !state.elements[type];
      savePreferences();
      updateElementsUI();
    });
  });
  
  // 6.5. Inline language toggles
  [dom.inlineToggleSa, dom.inlineToggleHi, dom.inlineToggleEn].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-lang');
      if (['sa', 'hi', 'en'].includes(type) && state.elements[type]) {
        const activeCount = ['sa', 'hi', 'en'].reduce((acc, curr) => acc + (state.elements[curr] ? 1 : 0), 0);
        if (activeCount <= 1) {
          showToast("At least one reading option must remain active!", "info");
          return;
        }
      }
      state.elements[type] = !state.elements[type];
      savePreferences();
      updateElementsUI();
    });
  });
  
  // 7. Global Settings Modal element checkboxes
  [dom.prefSa, dom.prefTranslit, dom.prefHi, dom.prefEn].forEach(checkbox => {
    if (!checkbox) return;
    checkbox.addEventListener('change', () => {
      const type = checkbox.id.replace('pref-', '');
      if (['sa', 'hi', 'en'].includes(type) && !checkbox.checked) {
        const activeCount = ['sa', 'hi', 'en'].reduce((acc, curr) => acc + (state.elements[curr] ? 1 : 0), 0);
        if (activeCount <= 1) {
          checkbox.checked = true;
          showToast("At least one reading option must remain active!", "info");
          return;
        }
      }
      state.elements[type] = checkbox.checked;
      savePreferences();
      updateElementsUI();
    });
  });
  
  // 8. Global Settings Modal Font Scale buttons
  [dom.btnScaleS, dom.btnScaleM, dom.btnScaleL, dom.btnScaleXl].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      state.fontSize = btn.id.endsWith('s') ? 'small' :
                       btn.id.endsWith('m') ? 'medium' :
                       btn.id.endsWith('l') ? 'large' : 'xlarge';
      savePreferences();
      updateFontSizeUI();
    });
  });
  
  // 9. Verse detail drawer triggers
  dom.btnCloseDetail.addEventListener('click', () => closeDrawer(dom.drawerVerseDetail));
  dom.overlayVerseDetail.addEventListener('click', () => closeDrawer(dom.drawerVerseDetail));
  
  if (dom.selectCommentator) {
    dom.selectCommentator.addEventListener('change', () => {
      updateCommentaryDisplay();
    });
  }
  
  dom.btnDetailBookmark.addEventListener('click', () => {
    if (state.activeVerse) {
      const key = `${state.activeVerse.chapter}.${state.activeVerse.verse}`;
      toggleBookmark(key);
      dom.btnDetailBookmark.blur();
    }
  });
  
  dom.btnDetailCopy.addEventListener('click', () => {
    if (state.activeVerse) {
      copyVerseToClipboard(state.activeVerse, dom.btnDetailCopy);
      dom.btnDetailCopy.blur();
    }
  });
  
  // 10. Seamless Chapter Navigation Footer triggers
  dom.btnPrevChapter.addEventListener('click', () => {
    if (state.activeChapter && state.activeChapter > 1) {
      navigateTo('reader', state.activeChapter - 1);
    } else {
      showToast("You are reading the first chapter.", "info");
    }
  });
  
  dom.btnNextChapter.addEventListener('click', () => {
    if (state.activeChapter && state.activeChapter < 18) {
      navigateTo('reader', state.activeChapter + 1);
    } else {
      showToast("You have reached the final chapter of the Gita.", "info");
    }
  });
  
  if (dom.btnReaderChaptersMenu) {
    dom.btnReaderChaptersMenu.addEventListener('click', () => navigateTo('chapters'));
  }
  
  // 11. Hash Routing listener for browser history (Forward / Back)
  window.addEventListener('hashchange', handleHashRouting);
  
  // 12. Theme Toggling triggers inside Settings Modal
  const btnThemeLight = document.getElementById('btn-theme-light');
  const btnThemeDark = document.getElementById('btn-theme-dark');
  if (btnThemeLight) {
    btnThemeLight.addEventListener('click', () => {
      if (state.theme !== 'light') {
        state.theme = 'light';
        localStorage.setItem('gita_pref_theme', 'light');
        applyThemeUI();
        showToast("Switched to Light Mode", "info");
      }
    });
  }
  if (btnThemeDark) {
    btnThemeDark.addEventListener('click', () => {
      if (state.theme !== 'dark') {
        state.theme = 'dark';
        localStorage.setItem('gita_pref_theme', 'dark');
        applyThemeUI();
        showToast("Switched to Dark Mode", "info");
      }
    });
  }
  
  // 13. Enhanced Floating Bottom Dock Navigation
  if (dom.btnNavHome) {
    dom.btnNavHome.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo('home');
      dom.btnNavHome.blur();
    });
  }
  if (dom.btnNavChapters) {
    dom.btnNavChapters.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo('chapters');
      dom.btnNavChapters.blur();
    });
  }
  if (dom.floatingRefCapsule) {
    dom.floatingRefCapsule.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleQuickNav();
    });
  }
  if (dom.btnNavBookmarks) {
    dom.btnNavBookmarks.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo('bookmarks');
      dom.btnNavBookmarks.blur();
    });
  }
  if (dom.btnNavSearch) {
    dom.btnNavSearch.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.screen === 'search') {
        // Already on search — just focus the keyboard directly
        if (dom.inputSearch) {
          dom.inputSearch.focus();
          dom.inputSearch.select();
        }
      } else {
        navigateTo('search');
      }
      dom.btnNavSearch.blur();
    });
  }

  // Bind suggested search keywords
  const keywordBtns = document.querySelectorAll('.keyword-pill-btn');
  keywordBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const kw = btn.getAttribute('data-keyword');
      if (dom.inputSearch) {
        dom.inputSearch.value = kw;
        dom.inputSearch.dispatchEvent(new Event('input'));
      }
    });
  });

  if (dom.btnNavSettings) {
    dom.btnNavSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo('settings');
      dom.btnNavSettings.blur();
    });
  }
  if (dom.btnCloseQuickNav) {
    dom.btnCloseQuickNav.addEventListener('click', (e) => {
      e.stopPropagation();
      closeQuickNav();
    });
  }

  // Prevent background scrolling when dragging/scrolling on the quick nav panel
  if (dom.panelQuickNav) {
    dom.panelQuickNav.addEventListener('touchmove', (e) => {
      const isScrollable = e.target.closest('.quick-nav-body');
      if (!isScrollable) {
        e.preventDefault();
      }
    }, { passive: false });
  }
  
  // Close quick nav popup upon clicking outside
  document.addEventListener('click', (e) => {
    if (dom.panelQuickNav && dom.panelQuickNav.classList.contains('open')) {
      if (!dom.panelQuickNav.contains(e.target) && !dom.readerQuickNav.contains(e.target)) {
        closeQuickNav();
      }
    }
  });

  // 14. Real-time Search handlers
  if (dom.inputSearch) {
    dom.inputSearch.addEventListener('input', handleSearchInput);
  }
  if (dom.btnClearSearch) {
    dom.btnClearSearch.addEventListener('click', clearSearch);
  }

  // 15. Native Speech Recitation button inside Expanded Verse Detail drawer
  const btnDetailSpeak = document.getElementById('btn-detail-speak');
  if (btnDetailSpeak) {
    btnDetailSpeak.addEventListener('click', () => {
      const sanskritText = dom.detailSanskritText.textContent;
      toggleRecitation(sanskritText, btnDetailSpeak);
      btnDetailSpeak.blur();
    });
  }

  // 16. Daily Reminders Alarm scheduling controls in Settings Modal
  const settingsReminderEnable = document.getElementById('settings-reminder-enable');
  const settingsReminderTime = document.getElementById('settings-reminder-time');
  if (settingsReminderEnable && settingsReminderTime) {
    // Load initial preference values from LocalStorage
    const savedEnable = localStorage.getItem('gita_pref_reminder_enable') === 'true';
    const savedTime = localStorage.getItem('gita_pref_reminder_time') || '06:30';
    settingsReminderEnable.checked = savedEnable;
    settingsReminderTime.value = savedTime;

    // Trigger initial scheduling on app boot
    if (window.AndroidBridge && window.AndroidBridge.scheduleDailyReminder) {
      try {
        window.AndroidBridge.scheduleDailyReminder(savedEnable, savedTime);
      } catch (e) {
        console.error("Initial reminder alarm register failed:", e);
      }
    }

    const handleReminderChange = () => {
      const enabled = settingsReminderEnable.checked;
      const timeVal = settingsReminderTime.value;
      localStorage.setItem('gita_pref_reminder_enable', enabled);
      localStorage.setItem('gita_pref_reminder_time', timeVal);

      if (window.AndroidBridge && window.AndroidBridge.scheduleDailyReminder) {
        try {
          window.AndroidBridge.scheduleDailyReminder(enabled, timeVal);
        } catch (e) {
          console.error("Reminder alarm schedule trigger failed:", e);
        }
      }
      showToast(enabled ? `Reminder scheduled daily at ${timeVal}` : "Daily reminders disabled", "info");
    };

    settingsReminderEnable.addEventListener('change', handleReminderChange);
    settingsReminderTime.addEventListener('change', handleReminderChange);
  }

  // 17. Spiritual Diary Search & Filter Tag selectors
  const bookmarksSearch = document.getElementById('bookmarks-search');
  if (bookmarksSearch) {
    bookmarksSearch.addEventListener('input', () => {
      renderBookmarks();
    });
  }

  const filterTags = document.querySelectorAll('.filter-tag');
  filterTags.forEach(tagBtn => {
    tagBtn.addEventListener('click', () => {
      filterTags.forEach(btn => btn.classList.remove('active'));
      tagBtn.classList.add('active');
      renderBookmarks();
    });
  });

  // Bind Select All / Deselect All
  const btnSelectAll = document.getElementById('btn-bookmarks-select-all');
  if (btnSelectAll) {
    btnSelectAll.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.bookmark-select-checkbox');
      checkboxes.forEach(cb => cb.checked = true);
      updateSelectedCount();
    });
  }

  const btnDeselectAll = document.getElementById('btn-bookmarks-deselect-all');
  if (btnDeselectAll) {
    btnDeselectAll.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.bookmark-select-checkbox');
      checkboxes.forEach(cb => cb.checked = false);
      updateSelectedCount();
    });
  }

  const btnExportDiary = document.getElementById('btn-export-diary');
  if (btnExportDiary) {
    btnExportDiary.addEventListener('click', () => {
      exportDiaryToPDF();
    });
  }
}

// --------------------------------------------------------------------------
// Quick Navigation Engine
// --------------------------------------------------------------------------
function toggleQuickNav() {
  if (!dom.panelQuickNav) return;
  const isOpen = dom.panelQuickNav.classList.contains('open');
  if (isOpen) {
    closeQuickNav();
  } else {
    openQuickNav();
  }
}

function openQuickNav() {
  if (!dom.panelQuickNav) return;
  renderQuickNav();
  dom.panelQuickNav.style.display = 'flex';
  setTimeout(() => {
    dom.panelQuickNav.classList.add('open');
    updateNavTabGlow();
  }, 10);
}

function closeQuickNav() {
  if (!dom.panelQuickNav) return;
  dom.panelQuickNav.classList.remove('open');
  setTimeout(() => {
    if (!dom.panelQuickNav.classList.contains('open')) {
      dom.panelQuickNav.style.display = 'none';
    }
    updateNavTabGlow();
  }, 350);
}

function renderQuickNav() {
  if (!dom.quickNavChapters || !dom.quickNavVerses) return;
  
  const currentChapter = state.activeChapter || 1;
  
  // 1. Generate Chapters Grid (1-18)
  dom.quickNavChapters.innerHTML = '';
  for (let c = 1; c <= 18; c++) {
    const btn = document.createElement('button');
    btn.className = `quick-nav-item ${c === currentChapter ? 'active' : ''}`;
    btn.textContent = c;
    btn.title = `Chapter ${c}`;
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.activeChapter = c;
      location.hash = `chapter=${c}`;
      renderQuickNav();
    });
    dom.quickNavChapters.appendChild(btn);
  }
  
  // 2. Generate Verses Grid based on selected chapter
  dom.quickNavVerses.innerHTML = '';
  const chData = GITA_DATA.chapters[currentChapter - 1];
  if (chData) {
    if (dom.quickNavLabel) {
      dom.quickNavLabel.textContent = `अध्याय ${romanize(currentChapter)} • CHAPTER ${currentChapter}`;
    }
    
    const activeVerseNum = (state.lastReadPosition && state.lastReadPosition.chapter === currentChapter) ? state.lastReadPosition.verse : 1;
    const verseCount = chData.verses_count;
    for (let v = 1; v <= verseCount; v++) {
      const btn = document.createElement('button');
      btn.className = `quick-nav-item ${v === activeVerseNum ? 'active' : ''}`;
      btn.textContent = v;
      btn.title = `Verse ${v}`;
      
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeQuickNav();
        
        const key = `${currentChapter}.${v}`;
        const targetCard = document.querySelector(`.verse-card[data-key="${key}"]`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          targetCard.classList.remove('verse-highlight-flash');
          void targetCard.offsetWidth; // Force Reflow
          targetCard.classList.add('verse-highlight-flash');
        }
      });
      dom.quickNavVerses.appendChild(btn);
    }
  }

  // 3. Generate Chapters Scrollable List (Dynamic list of all 18 Chapters for instant access)
  if (dom.quickNavChaptersList) {
    dom.quickNavChaptersList.innerHTML = '';
    const chProgressMap = JSON.parse(localStorage.getItem('gita_chapter_progress') || '{}');
    GITA_DATA.chapters.forEach(ch => {
      const item = document.createElement('div');
      item.className = 'quick-chapter-list-item';
      
      // Check if any verse in this chapter is bookmarked
      const chapterBookmarks = state.bookmarks.filter(k => k.startsWith(`${ch.chapter_number}.`));
      const badgeHTML = chapterBookmarks.length > 0 
        ? `<span class="quick-ch-saved-badge">🔥 ${chapterBookmarks.length} saved</span>`
        : '';
        
      // Read completion percentage
      const percent = chProgressMap[ch.chapter_number] || 0;
      let progressBadgeHTML = '';
      if (percent === 100) {
        progressBadgeHTML = `<span class="quick-ch-progress completed">100% Done</span>`;
      } else if (percent > 0) {
        progressBadgeHTML = `<span class="quick-ch-progress started">${percent}% Done</span>`;
      } else {
        progressBadgeHTML = `<span class="quick-ch-progress not-started">Not Started</span>`;
      }
      
      item.innerHTML = `
        <div class="quick-ch-left">
          <span class="quick-ch-num">Chapter ${ch.chapter_number} • अध्याय ${romanize(ch.chapter_number)}</span>
          <span class="quick-ch-title-sansk">${ch.name}</span>
          <div class="quick-ch-meta">
            ${progressBadgeHTML}
            ${badgeHTML}
          </div>
        </div>
        <div class="quick-ch-right">
          <span class="quick-ch-title-en">${ch.translation}</span>
          <span class="quick-ch-verses">${ch.verses_count} Verses</span>
        </div>
      `;
      
      item.onclick = (e) => {
        e.stopPropagation();
        closeQuickNav();
        navigateTo('reader', ch.chapter_number);
      };
      
      dom.quickNavChaptersList.appendChild(item);
    });
  }

  // 4. Initialize Navigation Tabs & Shortcut Scrolls
  initQuickNavTabs();
}

function initQuickNavTabs() {
  // Bind tab buttons
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  tabBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = newBtn.getAttribute('data-target');
      
      // Deactivate all tabs & contents
      document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.nav-tab-content').forEach(view => view.classList.remove('active'));
      
      // Activate clicked tab
      newBtn.classList.add('active');
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');
      
      updateNavTabGlow();
    });
  });

  // Bind page section shortcut scrolls
  const sectionBtns = document.querySelectorAll('.section-nav-link-btn');
  sectionBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const selector = newBtn.getAttribute('data-scroll-to');
      closeQuickNav();
      
      if (state.screen !== 'home') {
        navigateTo('home');
      }
      
      setTimeout(() => {
        const targetSec = document.querySelector(`.${selector}`) || document.getElementById(selector);
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, state.screen === 'home' ? 50 : 450);
    });
  });
}

// --------------------------------------------------------------------------
// General Helpers
// --------------------------------------------------------------------------
function romanize(num) {
  // Convert standard numbers to ancient Devanagari numbering representation
  const devanagariNumbers = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).split('').map(digit => devanagariNumbers[parseInt(digit)]).join('');
}

// --------------------------------------------------------------------------
// Real-time Verse & Quote Search Engine
// --------------------------------------------------------------------------
function handleSearchInput(e) {
  const query = e.target.value.toLowerCase().trim();
  
  if (!query) {
    clearSearch();
    return;
  }
  
  if (dom.btnClearSearch) {
    dom.btnClearSearch.style.display = 'inline-flex';
  }
  
  // Filter all verses using synonym dictionary
  const results = [];
  const queryWords = query.split(/\s+/).map(word => {
    const cleaned = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (typeof SYNONYMS !== 'undefined' && SYNONYMS[cleaned]) {
      return new RegExp(SYNONYMS[cleaned].join('|'), 'i');
    }
    return word;
  });
  
  Object.keys(GITA_DATA.verses).forEach(key => {
    const v = GITA_DATA.verses[key];
    if (!v) return;
    
    // Concatenate search targets safely
    const slok = (v.slok || "").toLowerCase();
    const translit = (v.transliteration || "").toLowerCase();
    const transHi = (v.translation_hi || "").toLowerCase();
    const transEn = (v.translation_en || "").toLowerCase();
    
    // Check if all query words match somewhere in the verse fields
    const matchesAll = queryWords.every(item => {
      if (item instanceof RegExp) {
        return item.test(slok) || item.test(translit) || item.test(transHi) || item.test(transEn);
      } else {
        return slok.includes(item) || translit.includes(item) || transHi.includes(item) || transEn.includes(item);
      }
    });
    
    if (matchesAll) {
      results.push(v);
    }
  });
  
  // Sort results numerically
  results.sort((a, b) => a.chapter - b.chapter || a.verse - b.verse);
  
  // Populate results
  if (dom.searchResults) {
    dom.searchResults.innerHTML = '';
    
    if (results.length === 0) {
      dom.searchResults.innerHTML = `
        <div class="search-no-results" style="text-align:center; padding:32px; color:var(--text-muted);">
          No matching verses found. Try another word or query!
        </div>
      `;
      return;
    }
    
    results.forEach(v => {
      const key = `${v.chapter}.${v.verse}`;
      const item = document.createElement('div');
      item.className = 'search-result-item';
      
      item.innerHTML = `
        <span class="search-result-ref">अध्याय ${v.chapter}, श्लोक ${v.verse}</span>
        <div class="search-result-slok sanskrit">${v.slok.substring(0, 100)}${v.slok.length > 100 ? '...' : ''}</div>
        <div class="search-result-trans">${v.translation_en}</div>
      `;
      
      item.addEventListener('click', () => {
        // Clear search UI
        clearSearch();
        
        // Navigate to reader chapter
        navigateTo('reader', v.chapter);
        
        // Wait for screen transition, scroll to verse, and flash highlight
        setTimeout(() => {
          const targetCard = document.querySelector(`.verse-card[data-key="${key}"]`);
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetCard.classList.remove('verse-highlight-flash');
            void targetCard.offsetWidth; // Force reflow
            targetCard.classList.add('verse-highlight-flash');
          }
        }, 400);
      });
      
      dom.searchResults.appendChild(item);
    });
  }
}

function clearSearch() {
  if (dom.inputSearch) {
    dom.inputSearch.value = '';
  }
  if (dom.btnClearSearch) {
    dom.btnClearSearch.style.display = 'none';
  }
  if (dom.searchResults) {
    dom.searchResults.innerHTML = `
      <div class="empty-state search-empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <p>Begin your search</p>
        <span>Type below or tap a theme to discover divine verses.</span>
      </div>
    `;
  }
}

// --------------------------------------------------------------------------
// Real-time Active Verse Scroll Tracking
// --------------------------------------------------------------------------
let scrollTimeout = null;

function handleReaderScroll() {
  if (state.screen !== 'reader' || !state.activeChapter) return;
  
  const cards = document.querySelectorAll('.verse-card');
  if (cards.length === 0) return;
  
  let currentActiveVerseKey = null;
  let minDiff = Infinity;
  const viewportHeaderHeight = 96; // Safe gap below fixed top header
  
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const diff = Math.abs(rect.top - viewportHeaderHeight);
    if (diff < minDiff) {
      minDiff = diff;
      currentActiveVerseKey = card.getAttribute('data-key');
    }
  });
  
  if (currentActiveVerseKey) {
    const [ch, vs] = currentActiveVerseKey.split('.');
    const verseNum = parseInt(vs);
    
    // Save last read position in runtime state
    state.lastReadPosition = {
      chapter: parseInt(ch),
      verse: verseNum,
      key: currentActiveVerseKey
    };

    // Log reading activity for streaks and heatmap
    if (typeof recordReadingEvent === 'function') {
      recordReadingEvent(currentActiveVerseKey);
    }
    
    // Throttle localStorage writing
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      localStorage.setItem('gita_last_read_position', JSON.stringify(state.lastReadPosition));
    }, 300);
    
    // A. Update bottom navigation pill text
    updateNavigationPillText(ch, vs);
    
    // B. Check if scrolled near the bottom of page to snap to 100%
    const isBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 16);
    const finalVerseNum = isBottom ? cards.length : verseNum;
    
    updateChapterProgress(finalVerseNum, cards.length);
  }
}

function updateNavigationPillText(chapter, verse) {
  if (!dom.floatingRefCapsule) return;
  
  if (state.screen === 'home') {
    dom.floatingRefCapsule.classList.remove('active');
    setTimeout(() => {
      if (state.screen === 'home') {
        dom.floatingRefCapsule.style.display = 'none';
      }
    }, 300);
    return;
  }
  
  dom.floatingRefCapsule.style.display = 'block';
  setTimeout(() => dom.floatingRefCapsule.classList.add('active'), 10);

  if (chapter && verse) {
    dom.floatingRefCapsule.textContent = `CH ${chapter} • VERSE ${verse}`;
  } else if (state.activeChapter) {
    dom.floatingRefCapsule.textContent = `CH ${state.activeChapter} • VERSE 1`;
  }
}

function updateChapterProgress(currentVerse, totalVerses) {
  const progressPercent = Math.min(100, Math.round((currentVerse / totalVerses) * 100));
  
  const bar = document.getElementById('chapter-progress-bar');
  if (bar) {
    bar.style.width = `${progressPercent}%`;
    bar.classList.add('active');
  }
  
  let maxProgress = progressPercent;
  // Persist maximum progress achieved in this chapter to local storage
  if (state.activeChapter) {
    const chProgress = JSON.parse(localStorage.getItem('gita_chapter_progress') || '{}');
    const chKey = String(state.activeChapter);
    const prevProgress = parseInt(chProgress[chKey]) || 0;
    if (progressPercent > prevProgress) {
      chProgress[chKey] = progressPercent;
      localStorage.setItem('gita_chapter_progress', JSON.stringify(chProgress));
      maxProgress = progressPercent;
    } else {
      maxProgress = prevProgress;
    }
  }

  const progressBadge = document.getElementById('reader-ch-progress');
  if (progressBadge) {
    progressBadge.textContent = `${maxProgress}% Completed`;
    progressBadge.style.display = 'inline-block';
  }
}

function hideProgressUI() {
  const bar = document.getElementById('chapter-progress-bar');
  if (bar) {
    bar.classList.remove('active');
    bar.style.width = '0%';
  }
  const progressBadge = document.getElementById('reader-ch-progress');
  if (progressBadge) {
    progressBadge.style.display = 'none';
  }
}

// Register global window scroll listener
let scrollScheduled = false;
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(() => {
      handleReaderScroll();
      scrollScheduled = false;
    });
  }
}, { passive: true });

// --------------------------------------------------------------------------
// Touch Gesture Swipe-to-Close Explanations Bottom Drawer
// --------------------------------------------------------------------------
function initSwipeToClose() {
  const drawer = dom.drawerVerseDetail;
  if (!drawer) return;
  
  const content = drawer.querySelector('.drawer-content');
  if (!content) return;
  
  let startY = 0;
  let currentY = 0;
  let isSwiping = false;
  
  content.addEventListener('touchstart', (e) => {
    const scrollContainer = drawer.querySelector('.drawer-body');
    // Only allow swipe down if we are scrolled to the very top of drawer details
    if (scrollContainer && scrollContainer.scrollTop > 0) {
      return;
    }
    
    startY = e.touches[0].clientY;
    currentY = startY;
    isSwiping = true;
    
    content.style.transition = 'none'; // Disable animations during manual drag
    const overlay = drawer.querySelector('.drawer-overlay');
    if (overlay) {
      overlay.style.transition = 'none';
    }
  }, { passive: true });
  
  content.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    // Only allow swiping downwards
    if (diff > 0) {
      content.style.transform = `translateY(${diff}px)`;
      
      const overlay = drawer.querySelector('.drawer-overlay');
      if (overlay) {
        const opacity = Math.max(0, 1 - (diff / 300));
        overlay.style.opacity = opacity;
      }
    }
  }, { passive: true });
  
  content.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    
    const diff = currentY - startY;
    const overlay = drawer.querySelector('.drawer-overlay');
    
    if (diff > 120) {
      // Smoothly animate the drawer sliding down to completion
      content.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      content.style.transform = 'translateY(100%)';
      
      if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
      }
      
      // Wait for slide-down animation to finish before closing drawer classes
      setTimeout(() => {
        closeDrawer(drawer);
        // Reset styles for next open
        content.style.transform = '';
        content.style.transition = '';
        if (overlay) {
          overlay.style.opacity = '';
          overlay.style.transition = '';
        }
      }, 300);
    } else {
      // Snap back to open position smoothly
      content.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      content.style.transform = 'translateY(0)';
      
      if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '1';
      }
      
      // Clear transitions after animation ends
      setTimeout(() => {
        if (!isSwiping) {
          content.style.transition = '';
          if (overlay) {
            overlay.style.transition = '';
          }
        }
      }, 300);
    }
    
    startY = 0;
    currentY = 0;
  });
}

// --------------------------------------------------------------------------
// Continue Reading and Study Guide Resumption Systems
// --------------------------------------------------------------------------
function initContinueReading() {
  const stored = localStorage.getItem('gita_last_read_position');
  if (stored) {
    state.lastReadPosition = JSON.parse(stored);
  } else {
    // Welcoming first-time users with a "Start Journey" card at Chapter 1, Verse 1
    state.lastReadPosition = { chapter: 1, verse: 1, key: "1.1", isFirstLaunch: true };
  }
  renderContinueCard();
}

function renderContinueCard() {
  const pos = state.lastReadPosition;
  if (!pos || !pos.key) return;
  
  const quickStartBtn = document.getElementById('btn-home-quick-start');
  const quickChaptersBtn = document.getElementById('btn-home-quick-chapters');
  const quickTitle = document.getElementById('lbl-home-quick-start-title');
  const quickDesc = document.getElementById('lbl-home-quick-start-desc');
  
  if (pos.isFirstLaunch) {
    if (quickTitle) quickTitle.textContent = 'Start';
    if (quickDesc) quickDesc.textContent = 'Chapter 1, Verse 1';
  } else {
    if (quickTitle) quickTitle.textContent = 'Resume';
    if (quickDesc) quickDesc.textContent = `Chapter ${pos.chapter}, Verse ${pos.verse}`;
  }

  // Bind Quick Actions Hub clicks
  if (quickStartBtn) {
    quickStartBtn.onclick = () => {
      if (pos.isFirstLaunch) {
        navigateTo('reader', 1);
        setTimeout(() => {
          const card = document.querySelector(`.verse-card[data-key="1.1"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.remove('verse-highlight-flash');
            void card.offsetWidth; // Force reflow
            card.classList.add('verse-highlight-flash');
          }
        }, 400);
      } else {
        navigateTo('reader', pos.chapter);
        setTimeout(() => {
          const card = document.querySelector(`.verse-card[data-key="${pos.key}"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.remove('verse-highlight-flash');
            void card.offsetWidth; // Force reflow
            card.classList.add('verse-highlight-flash');
          }
        }, 400);
      }
    };
  }
  
  if (quickChaptersBtn) {
    quickChaptersBtn.onclick = () => {
      navigateTo('chapters');
    };
  }
}

// Compiled Key Verses and Quotes for 12 profound themes of study
const STUDY_THEMES = [
  {
    id: "devotion",
    sanskrit: "भक्ति",
    english: "Devotion",
    title: "Path of Devotion • भक्तियोग",
    desc: "Bhakti Yoga is the path of pure love, self-surrender, and unwavering faith. Below are hand-compiled profound verses detailing the essence of devotion:",
    verses: ["12.2", "12.8", "12.13", "12.14", "9.22", "9.26", "9.27", "9.30", "9.34", "18.65"]
  },
  {
    id: "wisdom",
    sanskrit: "ज्ञान",
    english: "Wisdom",
    title: "Path of Wisdom • ज्ञानयोग",
    desc: "Jnana Yoga is the path of self-realization, wisdom, and distinguishing the eternal soul from the temporary physical self. Explore these curated verses on transcendental knowledge:",
    verses: ["2.11", "2.13", "2.14", "4.13", "4.34", "4.38", "4.39", "5.18", "13.28", "15.15"]
  },
  {
    id: "action",
    sanskrit: "कर्म",
    english: "Action",
    title: "Path of Action • कर्मयोग",
    desc: "Karma Yoga is the path of selfless action, dedicated duty, and acting without attachment to the rewards. Explore these timeless verses on the art of selfless work:",
    verses: ["2.38", "2.47", "2.48", "3.9", "3.19", "3.21", "3.35", "3.42", "18.46"]
  },
  {
    id: "peace",
    sanskrit: "शांति",
    english: "Peace",
    title: "Peace & Serenity • शांति",
    desc: "Explore verses that guide the mind towards absolute peace, tranquility, and freedom from desires and anxiety:",
    verses: ["2.62", "2.63", "2.70", "2.71", "5.22", "5.29", "18.61", "18.62"]
  },
  {
    id: "fearlessness",
    sanskrit: "अभय",
    english: "Fearlessness",
    title: "Fearlessness • अभय",
    desc: "Develop inner strength, resolve, and absolute fearlessness by understanding the eternal nature of truth:",
    verses: ["2.30", "2.40", "6.40", "16.1", "18.30", "18.66"]
  },
  {
    id: "meditation",
    sanskrit: "ध्यान",
    english: "Meditation",
    title: "Meditation & Focus • ध्यानयोग",
    desc: "The science of controlling the mind, focusing the intellect, and attaining Union through silent contemplation:",
    verses: ["6.5", "6.6", "6.19", "6.25", "6.26", "6.27", "6.47"]
  },
  {
    id: "soul",
    sanskrit: "आत्मा",
    english: "Eternal Soul",
    title: "The Eternal Soul • आत्मज्ञान",
    desc: "Timeless verses describing the immortal nature of the soul, which cannot be cut, burned, or destroyed:",
    verses: ["2.13", "2.20", "2.22", "2.23", "2.24", "2.27", "2.30", "15.7"]
  },
  {
    id: "surrender",
    sanskrit: "शरणागति",
    english: "Surrender",
    title: "Divine Surrender • शरणागति",
    desc: "The ultimate culmination of Gita's teachings: surrendering all duties and seeking absolute shelter in the Divine:",
    verses: ["7.14", "7.19", "9.27", "9.34", "18.61", "18.62", "18.65", "18.66"]
  },
  {
    id: "mind_control",
    sanskrit: "आत्मसंयम",
    english: "Mind Control",
    title: "Mind Control • आत्मसंयम",
    desc: "Unwavering techniques and warnings on how to master the turbulent mind and direct it towards self-realization:",
    verses: ["6.5", "6.6", "6.25", "6.26", "2.62", "2.63", "2.67", "3.42"]
  },
  {
    id: "faith",
    sanskrit: "श्रद्धा",
    english: "Faith & Focus",
    title: "Faith & Focus • श्रद्धा",
    desc: "Explore how faith determines our character, and how unwavering focus leads to ultimate wisdom and peace:",
    verses: ["4.39", "9.22", "12.2", "17.3", "18.66", "18.71"]
  },
  {
    id: "liberation",
    sanskrit: "मोक्ष",
    english: "Liberation",
    title: "Liberation • मोक्षयोग",
    desc: "Attain freedom from the cycles of material bondage and merge with absolute, infinite divine consciousness:",
    verses: ["5.28", "8.5", "9.27", "15.5", "18.61", "18.62", "18.66"]
  },
  {
    id: "duty",
    sanskrit: "धर्म",
    english: "Duty",
    title: "Duty & Righteousness • धर्म",
    desc: "Timeless wisdom on identifying one's true duty (Svadharma) and standing firm in righteousness:",
    verses: ["2.31", "3.9", "3.35", "4.7", "4.8", "18.46"]
  }
];

function initGuidedReadingPaths() {
  const container = document.getElementById('study-themes-grid');
  if (!container) return;
  
  container.innerHTML = '';
  
  STUDY_THEMES.forEach(theme => {
    const pill = document.createElement('div');
    pill.className = 'theme-pill glass';
    pill.innerHTML = `
      <span class="theme-pill-sanskrit">${theme.sanskrit}</span>
      <span class="theme-pill-english">${theme.english}</span>
    `;
    
    pill.onclick = () => {
      // Populate study guide drawer elements
      dom.studyGuideTitle.textContent = theme.title;
      dom.studyGuideDesc.textContent = theme.desc;
      
      dom.studyGuideList.innerHTML = '';
      theme.verses.forEach(vKey => {
        const v = GITA_DATA.verses[vKey];
        if (!v) return;
        
        const item = document.createElement('div');
        item.className = 'study-guide-card-item glass';
        item.innerHTML = `
          <span class="study-guide-card-ref">अध्याय ${v.chapter}, श्लोक ${v.verse} • CH ${v.chapter}, VS ${v.verse}</span>
          <p class="study-guide-card-slok sanskrit">${v.slok.replace(/\n/g, '<br>')}</p>
          <p class="study-guide-card-trans">${v.translation_en}</p>
          <button class="study-guide-card-jump">
            <span>Jump to Verse</span>
            <svg class="icon-small" viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
          </button>
        `;
        
        // Curated Verse Jump Trigger
        const btnJump = item.querySelector('.study-guide-card-jump');
        if (btnJump) {
          btnJump.onclick = (e) => {
            e.stopPropagation();
            closeDrawer(dom.drawerStudyGuide);
            navigateTo('reader', v.chapter);
            
            // Wait for transition, then smooth-scroll & flash highlight
            setTimeout(() => {
              const cardEl = document.querySelector(`.verse-card[data-key="${vKey}"]`);
              if (cardEl) {
                cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cardEl.classList.remove('verse-highlight-flash');
                void cardEl.offsetWidth; // Force Reflow
                cardEl.classList.add('verse-highlight-flash');
              }
            }, 400);
          };
        }
        
        dom.studyGuideList.appendChild(item);
      });
      
      openDrawer(dom.drawerStudyGuide);
    };
    
    container.appendChild(pill);
  });
}

// Global window-level back gesture handler invoked by Android native wrapper
function handleBackButton() {
  const drawerStreakAnalytics = document.getElementById('drawer-streak-analytics');
  if (drawerStreakAnalytics && drawerStreakAnalytics.classList.contains('open')) {
    closeDrawer(drawerStreakAnalytics);
    return true;
  }
  if (dom.drawerVerseDetail && dom.drawerVerseDetail.classList.contains('open')) {
    closeDrawer(dom.drawerVerseDetail);
    return true;
  }
  if (dom.drawerStudyGuide && dom.drawerStudyGuide.classList.contains('open')) {
    closeDrawer(dom.drawerStudyGuide);
    return true;
  }
  if (dom.panelQuickNav && dom.panelQuickNav.classList.contains('open')) {
    closeQuickNav();
    return true;
  }
  
  // If we are on search, settings, or bookmarks and have a saved reader chapter, go back to it!
  if ((state.screen === 'search' || state.screen === 'settings' || state.screen === 'bookmarks') && state.previousReaderChapter) {
    navigateTo('reader', state.previousReaderChapter);
    return true;
  }

  if (state.screen === 'reader') {
    navigateTo('chapters');
    return true;
  }

  if (state.screen !== 'home') {
    navigateTo('home');
    return true;
  }
  return false;
}
window.handleBackButton = handleBackButton;

// ==========================================================================
// 1. Text-To-Speech (TTS) Sanskrit Recitation Engine
// ==========================================================================
let currentSpeakingEl = null;

window.onSpeechFinished = function() {
  if (currentSpeakingEl) {
    currentSpeakingEl.classList.remove('speaking');
    currentSpeakingEl = null;
  }
};

function toggleRecitation(text, el) {
  // If clicked element is already reciting, stop it
  if (currentSpeakingEl) {
    if (window.AndroidBridge && window.AndroidBridge.stopSpeaking) {
      try {
        window.AndroidBridge.stopSpeaking();
      } catch (e) {
        console.error("Native stopSpeaking failed:", e);
      }
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const prevEl = currentSpeakingEl;
    currentSpeakingEl.classList.remove('speaking');
    currentSpeakingEl = null;
    
    if (prevEl === el) {
      showToast("Speech recitation stopped", "info");
      return;
    }
  }

  // Speak Devanagari Sanskrit shloka
  if (window.AndroidBridge && window.AndroidBridge.speakSanskrit) {
    try {
      el.classList.add('speaking');
      currentSpeakingEl = el;
      window.AndroidBridge.speakSanskrit(text);
      showToast("Reciting Sanskrit shloka...", "copy");
    } catch (e) {
      console.error("Native speakSanskrit failed:", e);
      fallbackSpeechSynthesis(text, el);
    }
  } else {
    fallbackSpeechSynthesis(text, el);
  }
}

function fallbackSpeechSynthesis(text, el) {
  if (!window.speechSynthesis) {
    showToast("Speech synthesis not supported on this device.", "info");
    return;
  }
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Hindi voice reads Sanskrit Devanagari perfectly
    utterance.onend = () => {
      if (currentSpeakingEl === el) {
        el.classList.remove('speaking');
        currentSpeakingEl = null;
      }
    };
    utterance.onerror = () => {
      if (currentSpeakingEl === el) {
        el.classList.remove('speaking');
        currentSpeakingEl = null;
      }
    };

    el.classList.add('speaking');
    currentSpeakingEl = el;
    window.speechSynthesis.speak(utterance);
    showToast("Reciting Sanskrit shloka (browser fallback)...", "copy");
  } catch (err) {
    showToast("Fallen back speech synthesis failed.", "info");
  }
}

// ==========================================================================
// 2. Reading Habit Streaks & Contribution Calendar Heatmap
// ==========================================================================
let lastRecordedVerseKey = null;

function recordReadingEvent(key) {
  if (key === lastRecordedVerseKey) return;
  lastRecordedVerseKey = key;

  const today = new Date().toISOString().split('T')[0];
  const events = JSON.parse(localStorage.getItem('gita_reading_events') || '{}');
  events[today] = (events[today] || 0) + 1;
  localStorage.setItem('gita_reading_events', JSON.stringify(events));

  // Trigger calendar update
  renderHeatmap();
}

function calculateStreak() {
  const events = JSON.parse(localStorage.getItem('gita_reading_events') || '{}');
  const dates = Object.keys(events).sort((a, b) => new Date(b) - new Date(a));
  
  if (dates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // If haven't read today or yesterday, streak is broken
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(dates[0]);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (events[dateStr]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function renderHeatmap() {
  const gridContainer = document.getElementById('analytics-streak-heatmap-grid');
  const fireBadge = document.getElementById('header-streak-count');
  const statsSpan = document.getElementById('analytics-heatmap-stats');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';

  const events = JSON.parse(localStorage.getItem('gita_reading_events') || '{}');
  
  // Calculate total verses read
  const totalVerses = Object.values(events).reduce((sum, val) => sum + val, 0);
  if (statsSpan) {
    statsSpan.textContent = `${totalVerses} ${totalVerses === 1 ? 'Verse' : 'Verses'} Read`;
  }

  // Render fire streak badge & best streak updates
  const streak = calculateStreak();
  let bestStreak = parseInt(localStorage.getItem('gita_best_streak') || '0');
  if (streak > bestStreak) {
    bestStreak = streak;
    localStorage.setItem('gita_best_streak', bestStreak.toString());
  }

  // Update badge count
  if (fireBadge) {
    fireBadge.textContent = streak;
  }

  // Update detailed analytics counters in bottom sheet
  const analyticsCurrentStreak = document.getElementById('analytics-current-streak');
  const analyticsBestStreak = document.getElementById('analytics-best-streak');
  if (analyticsCurrentStreak) analyticsCurrentStreak.textContent = streak;
  if (analyticsBestStreak) analyticsBestStreak.textContent = bestStreak;

  // Draw a 10-week grid (70 days) ending today
  const boxes = [];
  const today = new Date();
  
  // Start from 69 days ago (10 full weeks)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 69);

  // Align start to the nearest previous Monday/Sunday if desired, or keep it floating
  // Let's float exactly 70 days for a neat grid
  let iter = new Date(startDate);
  while (iter <= today) {
    const dateStr = iter.toISOString().split('T')[0];
    const count = events[dateStr] || 0;
    
    let level = 'level-0';
    if (count > 0 && count <= 2) level = 'level-1';
    else if (count > 2 && count <= 5) level = 'level-2';
    else if (count > 5) level = 'level-3';

    const box = document.createElement('div');
    box.className = `heatmap-box ${level}`;
    
    // Formatting local readable date trigger tooltip title
    const readableDate = iter.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    box.setAttribute('title', `${readableDate}: ${count} ${count === 1 ? 'verse' : 'verses'} read`);
    
    gridContainer.appendChild(box);
    
    iter.setDate(iter.getDate() + 1);
  }
}

// ==========================================================================
// 3. Consolidated Spiritual Diary Markdown Exporter
// ==========================================================================
function updateSelectedCount() {
  const checkboxes = document.querySelectorAll('.bookmark-select-checkbox');
  const checked = document.querySelectorAll('.bookmark-select-checkbox:checked');
  const countLabel = document.getElementById('bookmarks-selected-count');
  if (countLabel) {
    countLabel.textContent = `${checked.length} / ${checkboxes.length} Selected`;
  }
}

function exportDiaryToPDF() {
  const checkedCheckboxes = document.querySelectorAll('.bookmark-select-checkbox:checked');
  const selectedKeys = Array.from(checkedCheckboxes).map(cb => cb.getAttribute('data-key'));
  
  if (selectedKeys.length === 0) {
    showToast("Select at least one verse to export.", "info");
    return;
  }
  
  showToast(`Preparing ${selectedKeys.length} verse${selectedKeys.length > 1 ? 's' : ''}...`, "copy");
  
  let entriesHTML = '';
  // Sort selected keys numerically
  const sorted = [...selectedKeys].sort((a, b) => {
    const aParts = a.split('.');
    const bParts = b.split('.');
    return aParts[0] - bParts[0] || aParts[1] - bParts[1];
  });

  sorted.forEach(key => {
    const v = GITA_DATA.verses[key];
    if (!v) return;
    const meta = state.bookmarkMeta[key] || { notes: "", tags: [] };
    const tagsHTML = (meta.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join(' ');
    const notesText = meta.notes ? meta.notes.trim() : "";
    
    entriesHTML += `
      <div class="diary-entry">
        <div class="entry-header">Chapter ${v.chapter}, Verse ${v.verse} • अध्याय ${v.chapter}, श्लोक ${v.verse}</div>
        <div class="sanskrit-text">${v.slok}</div>
        <div class="translation">"${v.translation_en}"</div>
        ${notesText ? `
          <div class="reflection-box">
            <div class="reflection-title">My Reflections &amp; Study Notes</div>
            <div class="reflection-content">${notesText}</div>
          </div>
        ` : ''}
        ${meta.tags && meta.tags.length > 0 ? `
          <div class="tags-list">
            ${tagsHTML}
          </div>
        ` : ''}
      </div>
    `;
  });

  // Full self-contained HTML document (no external network requests — offline safe)
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spiritual Diary - Bhagavad Gita</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Mukta:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', Georgia, serif;
      color: #0f172a;
      padding: 40px;
      line-height: 1.7;
      background: #ffffff;
      font-size: 14px;
    }
    .cover {
      text-align: center;
      padding: 60px 0 50px;
      border-bottom: 2px solid #fed7aa;
      margin-bottom: 50px;
    }
    .cover h1 {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 2rem;
      color: #c2410c;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .cover .subtitle {
      font-size: 0.9rem;
      color: #64748b;
      letter-spacing: 1px;
    }
    .cover .date-line {
      margin-top: 16px;
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .diary-entry {
      margin-bottom: 48px;
      padding-bottom: 40px;
      border-bottom: 1px dashed #e2e8f0;
      page-break-inside: avoid;
    }
    .diary-entry:last-child { border-bottom: none; }
    .entry-header {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 1.1rem;
      color: #c2410c;
      font-weight: 700;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ffedd5;
    }
    .sanskrit-text {
      font-family: 'Mukta', sans-serif;
      font-size: 1.35rem;
      font-weight: 700;
      text-align: center;
      margin: 20px 0;
      color: #1e293b;
      white-space: pre-line;
      line-height: 1.9;
    }
    .translation {
      font-size: 1rem;
      color: #475569;
      margin-bottom: 16px;
      font-style: italic;
      text-align: center;
      line-height: 1.6;
      padding: 0 16px;
    }
    .reflection-box {
      background: #fff7ed;
      border-left: 3px solid #f97316;
      padding: 16px 20px;
      border-radius: 4px;
      margin-top: 16px;
    }
    .reflection-title {
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9a3412;
      margin-bottom: 8px;
    }
    .reflection-content {
      font-size: 0.95rem;
      color: #1e293b;
      white-space: pre-line;
      line-height: 1.6;
    }
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 14px;
    }
    .tag-badge {
      background: #ffedd5;
      color: #ea580c;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    @media print {
      body { padding: 20px; }
      .diary-entry { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>My Spiritual Diary</h1>
    <div class="subtitle">श्रीमद्भगवद्गीता स्वाध्याय • Bhagavad Gita Study Journal</div>
    <div class="date-line">Exported on ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })} • ${sorted.length} verse${sorted.length > 1 ? 's' : ''}</div>
  </div>
  ${entriesHTML}
</body>
</html>`;

  // Hand off to Android to open the system Print / Save-to-PDF dialog
  if (window.AndroidBridge && window.AndroidBridge.savePDF) {
    window.AndroidBridge.savePDF(fullHTML);
  } else {
    // Fallback for non-Android (browser) — open in new tab
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    showToast("Opening export preview...", "copy");
  }
}

// Called by Android when the PDF print dialog has been opened
function onPDFDialogOpened() {
  showToast("Save as PDF dialog opened — choose your location.", "copy");
}


// ==========================================================================
// 4. Semantic Concept Synonym Maps Dictionary
// ==========================================================================
const SYNONYMS = {
  "sad": ["sad", "sadness", "sorrow", "grief", "pain", "lament", "tears", "dilemma", "depression", "cry", "distress", "wail"],
  "sadness": ["sad", "sadness", "sorrow", "grief", "pain", "lament", "tears", "dilemma", "depression", "cry", "distress", "wail"],
  "sorrow": ["sad", "sadness", "sorrow", "grief", "pain", "lament", "tears", "dilemma", "depression", "cry", "distress", "wail"],
  "grief": ["sad", "sadness", "sorrow", "grief", "pain", "lament", "tears", "dilemma", "depression", "cry", "distress", "wail"],
  "fear": ["fear", "anxiety", "worry", "afraid", "bhaya", "courage", "fearlessness", "timid", "dread", "terrified"],
  "anxiety": ["fear", "anxiety", "worry", "afraid", "bhaya", "courage", "fearlessness", "timid", "dread", "terrified"],
  "worry": ["fear", "anxiety", "worry", "afraid", "bhaya", "courage", "fearlessness", "timid", "dread", "terrified"],
  "peace": ["peace", "calm", "serenity", "shanti", "quiet", "mind", "tranquil", "tranquility", "stillness"],
  "calm": ["peace", "calm", "serenity", "shanti", "quiet", "mind", "tranquil", "tranquility", "stillness"],
  "duty": ["duty", "dharma", "action", "work", "responsibility", "karma", "prescribed", "obligation"],
  "dharma": ["duty", "dharma", "action", "work", "responsibility", "karma", "prescribed", "obligation"],
  "action": ["action", "work", "deeds", "karma", "perform", "duty", "active"],
  "karma": ["action", "work", "deeds", "karma", "perform", "duty", "active"],
  "soul": ["soul", "atman", "spirit", "eternal", "immortal", "death", "body", "indestructible", "rebirth"],
  "atman": ["soul", "atman", "spirit", "eternal", "immortal", "death", "body", "indestructible", "rebirth"],
  "mind": ["mind", "intellect", "senses", "thoughts", "control", "restless", "meditation", "contemplation"],
  "control": ["control", "restrain", "master", "curb", "discipline", "mind", "harness"],
  "god": ["god", "krishna", "lord", "supreme", "divine", "creator", "ishvara", "absolute"],
  "krishna": ["god", "krishna", "lord", "supreme", "divine", "creator", "ishvara", "absolute"],
  "devotion": ["devotion", "bhakti", "worship", "surrender", "faith", "love", "loving", "refuge"],
  "bhakti": ["devotion", "bhakti", "worship", "surrender", "faith", "love", "loving", "refuge"],
  "surrender": ["surrender", "refuge", "submit", "abandon", "shelter", "protection"],
  "liberation": ["liberation", "moksha", "freedom", "emancipation", "release", "attain"],
  "moksha": ["liberation", "moksha", "freedom", "emancipation", "release", "attain"]
};

