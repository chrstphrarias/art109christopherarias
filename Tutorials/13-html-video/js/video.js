console.log("gdrshbwwwwwwdrbdftbderhgbfrbdfgb");

const hoverVideos = document.querySelectorAll('.hover-video');  

document.querySelectorAll('video').forEach(video => {
    video.addEventListener('click', () => {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });
});

hoverVideos.forEach(video => {

    video.addEventListener('mouseenter', () => {
        video.play();
    });
    video.addEventListener('mouseleave', () => {
        video.pause();
    });
});