// Detect mobile and show/hide elements accordingly (for extra safety)
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
document.addEventListener('DOMContentLoaded', () => {
    if (isMobile()) {
        document.querySelectorAll('.desktop-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.ad-slot').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.game-frame').forEach(el => el.style.display = 'none');
        const msg = document.getElementById('mobile-message');
        if (msg) msg.style.display = 'block';
    }
});
