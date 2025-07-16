// news-loader.js
// Handles dynamic loading of news posts for the news page

// List of all news posts (add new posts here as objects)
const newsPosts = [
    {
        href: "https://DaggerQuest.com/news/patch-notes-044",
        img: "images/044.webp",
        alt: "DaggerQuest 0.4.4",
        headline: "0.4.4 Patch Notes"
    },
    {
        href: "https://DaggerQuest.com/news/patch-notes-043",
        img: "images/043.webp",
        alt: "DaggerQuest 0.4.3",
        headline: "0.4.3 Patch Notes"
    },
    {
        href: "https://DaggerQuest.com/news/patch-notes-042",
        img: "images/042.webp",
        alt: "DaggerQuest 0.4.2",
        headline: "0.4.2 Patch Notes"
    },
    {
        href: "https://DaggerQuest.com/news/patch-notes-041",
        img: "images/041.webp",
        alt: "DaggerQuest 0.4.1",
        headline: "0.4.1 Patch Notes"
    },
    {
        href: "https://DaggerQuest.com/news/patch-notes-040",
        img: "images/040.webp",
        alt: "DaggerQuest 0.4.0",
        headline: "0.4.0 Patch Notes"
    },
    {
        href: "https://DaggerQuest.com/news/patch-notes-039",
        img: "images/039.webp",
        alt: "DaggerQuest 0.3.9",
        headline: "0.3.9 Patch Notes"
    },
    {
        href: "https://DaggerQuest.com/news/patch-notes-038",
        img: "images/038.webp",
        alt: "DaggerQuest 0.3.8",
        headline: "0.3.8 Patch Notes"
    },
    {
        href: "https://DaggerQuest.com/news/patch-notes-037",
        img: "images/037.webp",
        alt: "DaggerQuest 0.3.7",
        headline: "0.3.7 Patch Notes"
    },
    {
        href: "https://DaggerQuest.com/news/patch-notes-036",
        img: "images/036.webp",
        alt: "DaggerQuest 0.3.6",
        headline: "0.3.6 Patch Notes"
    },
    {
        href: "https://DaggerQuest.com/news/patch-notes-035",
        img: "images/035.webp",
        alt: "DaggerQuest 0.3.5",
        headline: "0.3.5 Patch Notes"
    },
    {
        href: "https://DaggerQuest.com/news/patch-notes-034",
        img: "images/034.webp",
        alt: "DaggerQuest 0.3.4",
        headline: "0.3.4 Patch Notes"
    }
];
const postsPerPage = 6;
let currentCount = 0;
const newsReel = document.getElementById('news-reel');
const showMoreBtn = document.getElementById('show-more-btn');
function createPost(post) {
    const a = document.createElement('a');
    a.className = 'news-post';
    a.href = post.href;
    const img = document.createElement('img');
    img.src = post.img;
    img.alt = post.alt;
    img.className = 'news-thumb';
    const div = document.createElement('div');
    div.className = 'news-headline';
    div.textContent = post.headline;
    a.appendChild(img);
    a.appendChild(div);
    return a;
}
function loadPosts() {
    const end = Math.min(currentCount + postsPerPage, newsPosts.length);
    for (let i = currentCount; i < end; i++) {
        newsReel.appendChild(createPost(newsPosts[i]));
    }
    currentCount = end;
    if (currentCount >= newsPosts.length) {
        showMoreBtn.style.display = 'none';
    } else {
        showMoreBtn.style.display = '';
    }
}
showMoreBtn.addEventListener('click', loadPosts);
// Initial load
newsReel.innerHTML = '';
loadPosts();
