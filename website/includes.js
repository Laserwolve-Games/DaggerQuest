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
  // Update footer links to use correct basePath
  const footerLinks = document.querySelectorAll('#footer a');
  footerLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
      link.setAttribute('href', basePath + href);
    }
  });
  // Update footer images to use correct basePath
  const footerImgs = document.querySelectorAll('#footer img');
  footerImgs.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('#')) {
      img.setAttribute('src', basePath + src);
    }
  });
});

// Add favicon dynamically to every page
(() => {
  const head = document.head;
  // Add charset meta tag if not present (should be first in head)
  if (head && !document.querySelector('meta[charset]')) {
    const charset = document.createElement('meta');
    charset.setAttribute('charset', 'UTF-8');
    // Insert as the first child of <head>
    if (head.firstChild) {
      head.insertBefore(charset, head.firstChild);
    } else {
      head.appendChild(charset);
    }
  }
  if (head && !document.querySelector('link[rel="icon"]')) {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = basePath + 'game/icons/icon-64.png';
    head.appendChild(favicon);
  }
  // Add viewport meta tag if not present
  if (head && !document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0';
    head.appendChild(viewport);
  }
  // This works, but causes a FOUC (Flash of Unstyled Content) on the first load
  // if (head && !document.querySelector('link[rel="stylesheet"][href$="style.css"]')) {
  //   const stylesheet = document.createElement('link');
  //   stylesheet.rel = 'stylesheet';
  //   stylesheet.href = basePath + 'style.css';
  //   head.appendChild(stylesheet);
  // }
})();

if (location.hostname === "daggerquest.com") {

  // Add Google Analytics dynamically to every page
  (() => {
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
   
}
else console.warn('Not running on DaggerQuest.com, skipping analytics');

// Function to toggle mobile menu with accessibility support
function toggleMobileMenu(button) {
    const menu = document.querySelector('.navbar-menu');
    if (menu) {
        const isOpen = menu.classList.contains('open');
        menu.classList.toggle('open');
        button.setAttribute('aria-expanded', !isOpen);
    }
}

// Make the function globally available
window.toggleMobileMenu = toggleMobileMenu;

// Add accessibility styles
(() => {
    if (!document.querySelector('#accessibility-styles')) {
        const styles = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'accessibility-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
})();
