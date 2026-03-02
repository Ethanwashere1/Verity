// game.js - separate game logic for mission timeline

// initialize page behaviors when loaded
function initGamePage() {
    const missions = document.querySelectorAll('.missions .mission-box');
    missions.forEach(box => {
        box.addEventListener('click', () => {
            showMission(box.dataset.mission);
        });
    });
}

function showMission(id) {
    document.getElementById('timeline').style.display = 'none';
    const gameArea = document.getElementById('game-area');
    gameArea.style.display = 'grid';
    document.getElementById('left-panel').textContent = 'Mission ' + id + ' - left content';
    document.getElementById('right-panel').src = "/Assets/Prisoner 1 SVG.svg";
}

// wait for DOM ready and run
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('game-page')) {
        initGamePage();
    }
});
