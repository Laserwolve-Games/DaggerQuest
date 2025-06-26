// media-loader.js
// Dynamically loads media posts (wallpapers) into the media page

const wallpapers = [
    {
        name: "splash screen",
        thumb: "images/splashScreen.webp",
        full: "images/wallpapers/splashScreen.png"
    },
    {
        name: "screenshot",
        thumb: "images/screenshot.webp",
        full: "images/wallpapers/screenshot.png"
    },
    {
        name: "main menu",
        thumb: "images/mainMenu.webp",
        full: "images/wallpapers/mainMenu.png"
    },
    {
        name: "loading screen",
        thumb: "images/loadingScreen.webp",
        full: "images/wallpapers/loadingScreen.png"
    }
];

function createMediaPost(wallpaper) {
    const post = document.createElement('div');
    post.className = 'news-post media-post';
    post.innerHTML = `
        <div class="media-thumb-container">
            <a href="${wallpaper.full}" target="_blank">
                <img class="media-thumb" src="${wallpaper.thumb}" alt="${wallpaper.name}">
            </a>
        </div>
        <div class="media-title">${wallpaper.name}</div>
    `;
    return post;
}

document.addEventListener('DOMContentLoaded', () => {
    const reel = document.getElementById('media-reel');
    wallpapers.forEach(wallpaper => {
        reel.appendChild(createMediaPost(wallpaper));
    });
});
