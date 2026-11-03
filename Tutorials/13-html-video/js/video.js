console.log("gdrshbwwwwwwdrbdftbderhgbfrbdfgb");

const hoverVideos = document.querySelectorAll('.hover-video');  


hoverVideos.forEach(video => {

    video.addEventListener('mouseenter', () => {
        video.play();
    });
    video.addEventListener('mouseleave', () => {
        video.pause();
    });
});