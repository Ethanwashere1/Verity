// tutorial.js - handle video modal interactions

document.addEventListener('DOMContentLoaded', function() {
    initVideoModal();
});

function initVideoModal() {
    const cards = document.querySelectorAll('.tutorial-card');
    const modal = document.getElementById('video-modal');
    const closeBtn = document.querySelector('.modal-close');
    const videoPlayer = document.getElementById('video-player');

    // click on play button or card to open modal
    cards.forEach(card => {
        const playBtn = card.querySelector('.play-button');
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openVideo(card);
        });
    });

    // close modal when clicking close button
    closeBtn.addEventListener('click', function() {
        closeModal();
    });

    // close modal when clicking outside content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function openVideo(card) {
    const modal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    const videoId = card.getAttribute('data-video-url');
    
    // convert video ID to embed URL
    if (videoId) {
        const embedUrl = 'https://www.youtube.com/embed/' + videoId;
        videoPlayer.src = embedUrl;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    
    modal.classList.remove('active');
    videoPlayer.src = ''; // stop video playback
}
