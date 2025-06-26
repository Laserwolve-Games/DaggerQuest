// Determine the base path for includes depending on current location
const basePath = (window.location.pathname.includes('/news/')) ? '../' : '';

fetch(basePath + 'header.html').then(res => res.text()).then(data => {
  document.getElementById('header').innerHTML = data;
  const logo = document.getElementById('header-logo');
  if (logo) {
    const currentSrc = logo.getAttribute('src');
    logo.setAttribute('src', basePath + currentSrc);
  }

  const navLinks = document.querySelectorAll('.navbar a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
        // Correctly resolve the path for the news link when on a news page.
        if (window.location.pathname.includes('/news/') && href.endsWith('news.html')) {
            link.setAttribute('href', '../news.html');
        } else {
            link.setAttribute('href', basePath + href);
        }
    }
  });
});
fetch(basePath + 'footer.html').then(res => res.text()).then(data => {
  document.getElementById('footer').innerHTML = data;
});

// Add favicon dynamically to every page
(function() {
  const head = document.head;
  if (head && !document.querySelector('link[rel="icon"]')) {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = basePath + 'game/icons/icon-64.png';
    head.appendChild(favicon);
  }
})();

// Add Google Analytics dynamically to every page
(function() {
  const head = document.head;
  if (head && !document.getElementById('google-gtag')) {
    // Add the gtag.js script
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-C5SY437DMY';
    gaScript.id = 'google-gtag';
    head.appendChild(gaScript);

    // Add the inline config script
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-C5SY437DMY');`;
    head.appendChild(inlineScript);
  }
})();
