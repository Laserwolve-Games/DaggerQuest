// https://github.com/Laserwolve-Games/DaggerQuest/issues/64
console.log('Checking for bad version of DaggerQuest...');
const getFileHash = async (url) => {
  const buf = await fetch(url).then(r => r.arrayBuffer());
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};

(async () => {
  try {
    const dataJsonHash = await getFileHash('game/data.json');
    const c3MainJsHash = await getFileHash('game/scripts/c3main.js');
    if (
      dataJsonHash === 'EDF198990E10676A898E348202FE6D471A830A4D6D0F28ADF293A3A17D387657' &&
      c3MainJsHash === 'B981D60C39E8AF0F2D0A9B97D0DFC5CF93906DFC3451B4E122B7DCD77991A23A'
    ) {
        console.log('Bad version of DaggerQuest detected. Clearing browser storage...');
        try { localStorage.clear(); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}
    } else {
      console.log('DaggerQuest version is valid. No storage cleared.');
    }
  } catch (e) {
    console.error('Error checking DaggerQuest version:', e);
  }
})();