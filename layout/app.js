// Phase 2 Layout Controller
// Handles dynamic database loading, search query matching, email template compilation, and mobile options drawer.

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let activeEdition = '';
  let allEditionsCache = {}; // Cache to store fetched JSON data for search
  let isSearchActive = false;

  // DOM Elements
  const editionSelect = document.getElementById('edition-select');
  const searchInput = document.getElementById('search-input');
  const exporterToggle = document.getElementById('exporter-toggle');
  const exporterBack = document.getElementById('exporter-back');
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const emailWorkspace = document.getElementById('email-workspace');
  const archiveWorkspace = document.getElementById('archive-workspace');
  const emailPreviewCanvas = document.getElementById('email-preview-canvas');

  // List containers
  const listProducts = document.getElementById('list-products');
  const listScience = document.getElementById('list-science');
  const listBlog = document.getElementById('list-blog');

  // Mobile Drawer Elements
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
  const closeDrawerBtn = document.getElementById('close-drawer');
  const mobileEditionOptions = document.getElementById('mobile-edition-options');
  const selectWrapper = document.querySelector('.select-wrapper');

  // 1. Initialize Edition List
  if (typeof availableEditions !== 'undefined' && availableEditions.length > 0) {
    // Sort editions chronologically descending (latest first)
    const sortedEditions = [...availableEditions].sort((a, b) => new Date(b) - new Date(a));
    
    // Default to latest edition
    activeEdition = sortedEditions[0];

    // Populate desktop dropdown select
    editionSelect.innerHTML = '';
    sortedEditions.forEach(edition => {
      const option = document.createElement('option');
      option.value = edition;
      option.textContent = edition;
      editionSelect.appendChild(option);
    });
    editionSelect.value = activeEdition;

    // Load and cache all editions for real-time search
    initAndCacheAllEditions(sortedEditions);
  } else {
    console.error('No editions catalog found inside data/index.js');
  }

  // 2. Fetch and Cache Database
  async function initAndCacheAllEditions(editions) {
    const fetchPromises = editions.map(async (edition) => {
      const [year, month] = edition.split('-');
      const filePath = `../data/${year}-${month}/data-${edition}.json`;
      try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        allEditionsCache[edition] = data;
      } catch (err) {
        console.error(`Failed to load database for edition ${edition}:`, err);
      }
    });

    await Promise.all(fetchPromises);
    
    // Trigger initial render
    renderActiveEdition();
  }

  // 3. Render Active Edition
  function renderActiveEdition() {
    const data = allEditionsCache[activeEdition];
    if (!data) return;

    // Clear previous elements
    clearCategoryLists();

    // Render lists
    renderCategory(data['product and concept releases'] || [], listProducts);
    renderCategory(data['scientific breakthroughs'] || [], listScience);
    renderCategory(data['blog posts & news'] || [], listBlog);
  }

  function clearCategoryLists() {
    listProducts.innerHTML = '';
    listScience.innerHTML = '';
    listBlog.innerHTML = '';
  }

  // Helper: Format ISO date string to readable format
  function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
  }

  // Helper: Render individual content cards
  function renderCategory(items, container) {
    if (items.length === 0) {
      container.innerHTML = '<p class="content-summary" style="opacity: 0.5; font-style: italic;">no articles available in this category.</p>';
      return;
    }

    items.forEach(item => {
      const article = document.createElement('article');
      article.className = 'content-card';

      // Sculpture image container
      const imgContainer = document.createElement('div');
      imgContainer.className = 'sculpture-container';
      const img = document.createElement('img');
      // Resolve path relative to layout root
      img.src = `../${item.picture}`;
      img.alt = item.title;
      img.loading = 'lazy';
      imgContainer.appendChild(img);

      // Title header
      const titleEl = document.createElement('h3');
      titleEl.className = 'content-title';
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = item.title;
      titleEl.appendChild(link);

      // Summary copy
      const summaryEl = document.createElement('p');
      summaryEl.className = 'content-summary';
      summaryEl.textContent = item.summary;

      // Metadata elements
      const metaEl = document.createElement('div');
      metaEl.className = 'content-meta';
      
      const timeEl = document.createElement('time');
      timeEl.setAttribute('datetime', item.date);
      timeEl.textContent = formatDate(item.date);

      const authorSpan = document.createElement('span');
      authorSpan.className = 'content-author';
      authorSpan.textContent = ` — ${item.author}`;

      metaEl.appendChild(timeEl);
      metaEl.appendChild(authorSpan);

      // Assemble card elements
      article.appendChild(imgContainer);
      article.appendChild(titleEl);
      article.appendChild(summaryEl);
      article.appendChild(metaEl);

      container.appendChild(article);
    });
  }

  // 4. Dropdown Select Change Handler
  editionSelect.addEventListener('change', (e) => {
    activeEdition = e.target.value;
    if (!isSearchActive) {
      renderActiveEdition();
    }
  });

  // 5. Real-time Search Ingestion & Filters
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (!query) {
      isSearchActive = false;
      renderActiveEdition();
      return;
    }

    isSearchActive = true;
    clearCategoryLists();

    // Accumulators for matching search results across ALL historical issues
    const matchesProducts = [];
    const matchesScience = [];
    const matchesBlog = [];

    Object.keys(allEditionsCache).forEach(editionDate => {
      const data = allEditionsCache[editionDate];
      if (!data) return;

      // Filter product releases
      (data['product and concept releases'] || []).forEach(item => {
        if (matchesSearch(item, query)) matchesProducts.push(item);
      });

      // Filter scientific breakthroughs
      (data['scientific breakthroughs'] || []).forEach(item => {
        if (matchesSearch(item, query)) matchesScience.push(item);
      });

      // Filter blog posts
      (data['blog posts & news'] || []).forEach(item => {
        if (matchesSearch(item, query)) matchesBlog.push(item);
      });
    });

    // Render filtered sets
    renderCategory(matchesProducts, listProducts);
    renderCategory(matchesScience, listScience);
    renderCategory(matchesBlog, listBlog);
  });

  function matchesSearch(item, query) {
    const titleMatch = (item.title || '').toLowerCase().includes(query);
    const summaryMatch = (item.summary || '').toLowerCase().includes(query);
    const labelMatch = (item.labels || []).some(label => label.toLowerCase().includes(query));
    return titleMatch || summaryMatch || labelMatch;
  }

  // 6. Email Exporter Panel & View Swapping
  exporterToggle.addEventListener('click', () => {
    document.body.classList.add('mode-email');
    renderEmailPreview();
  });

  exporterBack.addEventListener('click', () => {
    document.body.classList.remove('mode-email');
  });

  function renderEmailPreview() {
    const data = allEditionsCache[activeEdition];
    if (!data) return;

    const emailHTML = compileEmailHTML(data);
    emailPreviewCanvas.innerHTML = emailHTML;
  }

  // 7. HTML Email compiler (nested tables, inline styled)
  function compileEmailHTML(data) {
    const brandColor = '#5c533c'; // Tinos bronze
    const textColor = '#161616';  // Charcoal black
    const canvasColor = '#f5f4f0'; // Limestone eggshell
    const accentColor = '#c5a059'; // Accent gold

    let categoriesHTML = '';

    const categories = [
      { key: 'product and concept releases', title: 'product and concept releases' },
      { key: 'scientific breakthroughs', title: 'scientific breakthroughs' },
      { key: 'blog posts & news', title: 'blog posts & news' }
    ];

    categories.forEach(cat => {
      const items = data[cat.key] || [];
      if (items.length === 0) return;

      let itemsHTML = '';
      items.forEach(item => {
        // Build inline table cells for each article
        itemsHTML += `
          <tr>
            <td style="padding-bottom: 40px; font-family: 'Oxygen', Arial, sans-serif;">
              <!-- Article Title -->
              <h3 style="font-family: 'Tinos', Georgia, serif; font-size: 20px; font-weight: bold; margin: 0 0 10px 0; text-transform: lowercase;">
                <a href="${item.url}" target="_blank" style="color: ${textColor}; text-decoration: none;">${item.title}</a>
              </h3>
              <!-- Summary Copy -->
              <p style="font-size: 15px; color: ${textColor}; line-height: 1.6; margin: 0 0 10px 0; opacity: 0.85;">
                ${item.summary}
              </p>
              <!-- Metadata Info -->
              <div style="font-size: 13px; color: ${textColor}; opacity: 0.6; text-transform: lowercase;">
                <span>${formatDate(item.date)}</span> — <span>${item.author}</span>
              </div>
            </td>
          </tr>
        `;
      });

      categoriesHTML += `
        <!-- Category Section -->
        <tr>
          <td style="padding: 20px 0 10px 0; font-family: 'Oxygen', Arial, sans-serif;">
            <h2 style="font-size: 15px; font-weight: bold; text-transform: lowercase; letter-spacing: 1px; color: ${textColor}; border-bottom: 1px solid rgba(22,22,22,0.08); padding-bottom: 8px; margin: 0 0 20px 0;">
              ${cat.title}
            </h2>
          </td>
        </tr>
        ${itemsHTML}
      `;
    });

    // Outer table frame
    return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${canvasColor}; padding: 40px 0; width: 100% !important;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; text-align: left;">
              <!-- Header Row -->
              <tr>
                <td style="padding: 0 20px 30px 20px; font-family: 'Tinos', Georgia, serif; border-bottom: 1px solid rgba(22,22,22,0.08);">
                  <h1 style="font-size: 38px; font-weight: bold; color: ${brandColor}; margin: 0; text-transform: lowercase; letter-spacing: -1px;">
                    ai chronicle hub
                  </h1>
                  <p style="font-family: 'Oxygen', Arial, sans-serif; font-size: 14px; font-weight: bold; color: ${textColor}; margin: 5px 0 0 0; text-transform: lowercase; opacity: 0.6;">
                    edition: ${activeEdition}
                  </p>
                </td>
              </tr>
              <!-- Content Body -->
              <tr>
                <td style="padding: 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${categoriesHTML}
                  </table>
                </td>
              </tr>
              <!-- Footer Row -->
              <tr>
                <td style="padding: 30px 20px 10px 20px; font-family: 'Oxygen', Arial, sans-serif; font-size: 12px; color: ${textColor}; opacity: 0.5; text-align: center; border-top: 1px solid rgba(22,22,22,0.08);">
                  <p style="margin: 0; text-transform: lowercase;">
                    you are receiving this as part of the weekly ai chronicle digest.
                  </p>
                  <p style="margin: 5px 0 0 0; text-transform: lowercase;">
                    ai chronicle hub &copy; ${new Date().getFullYear()}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  // 8. Clipboard Copy Functionality
  copyEmailBtn.addEventListener('click', () => {
    const data = allEditionsCache[activeEdition];
    if (!data) return;

    const emailHTML = compileEmailHTML(data);

    navigator.clipboard.writeText(emailHTML)
      .then(() => {
        // Visual Copy Feedback micro-interaction
        const originalText = copyEmailBtn.textContent;
        copyEmailBtn.textContent = 'copied!';
        copyEmailBtn.style.backgroundColor = accentColorValue();
        copyEmailBtn.style.color = '#161616';

        setTimeout(() => {
          copyEmailBtn.textContent = originalText;
          copyEmailBtn.style.backgroundColor = '';
          copyEmailBtn.style.color = '';
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy email HTML: ', err);
      });
  });

  function accentColorValue() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent-gold').trim();
  }

  // 9. Mobile Bottom-Sheet Drawer Interactions
  function openMobileDrawer() {
    // Populate drawer with options
    mobileEditionOptions.innerHTML = '';
    
    if (typeof availableEditions !== 'undefined') {
      const sortedEditions = [...availableEditions].sort((a, b) => new Date(b) - new Date(a));
      sortedEditions.forEach(edition => {
        const btn = document.createElement('button');
        btn.className = `mobile-option-btn ${edition === activeEdition ? 'active' : ''}`;
        btn.textContent = edition;
        btn.addEventListener('click', () => {
          activeEdition = edition;
          editionSelect.value = edition;
          if (!isSearchActive) {
            renderActiveEdition();
          }
          closeMobileDrawer();
        });
        mobileEditionOptions.appendChild(btn);
      });
    }
    
    document.body.classList.add('drawer-open');
  }

  function closeMobileDrawer() {
    document.body.classList.remove('drawer-open');
  }

  // On mobile viewports, block default dropdown click and show custom bottom sheet drawer
  selectWrapper.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      // Temporarily blur select to avoid triggering native UI picker
      editionSelect.blur();
      openMobileDrawer();
    }
  });

  // Intercept changes on selector
  editionSelect.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      editionSelect.blur();
    }
  });

  closeDrawerBtn.addEventListener('click', closeMobileDrawer);
  mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);
});
