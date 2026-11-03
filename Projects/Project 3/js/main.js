const state = {
    chaos: 0,
    clicks: 0,
    deaths: 0,
    callShown: false,
    soundMuted: false,
    uiMode: 0,
    camera: null,
    audio: null,
    volume: null
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function get(selector) {
    return document.querySelector(selector);
}

function changeChaos(amount) {
    state.chaos = Math.max(0, Math.min(100, state.chaos + amount));
    get("#chaos-meter").value = state.chaos;
    get("#chaos-value").textContent = state.chaos;
}

function cycleInterface() {
    const modes = ["", "ui-shift-1", "ui-shift-2", "ui-shift-3", "ui-shift-4"];
    state.uiMode = (state.uiMode + 1) % modes.length;
    document.body.classList.remove(...modes.filter(Boolean));
    if (modes[state.uiMode]) {
        document.body.classList.add(modes[state.uiMode]);
    }
}

function updateDeaths() {
    state.deaths += 1;
    get("#death-count").textContent = state.deaths;
    changeChaos(8);
}

function startAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        return;
    }

    if (!state.audio) {
        state.audio = new AudioContext();
        state.volume = state.audio.createGain();
        state.volume.gain.value = state.soundMuted ? 0 : 0.15;
        state.volume.connect(state.audio.destination);
    }

    state.audio.resume().catch((error) => console.error("Could not start audio.", error));
}

/*
function playWarpSound() {
    if (state.soundMuted || !state.audio) {
        return;
    }

    const tone = state.audio.createOscillator();
    tone.type = "sawtooth";
    tone.frequency.setValueAtTime(60, state.audio.currentTime);
    t
    tone.start();
    tone.stop(state.audio.currentTime + 5);
}
*/

function playWarpSound() {
    if (state.soundMuted || !state.audio) {
        return;
    }

    const tone = state.audio.createOscillator();
    tone.type = "sawtooth";
    tone.frequency.setValueAtTime(90, state.audio.currentTime);
    tone.frequency.linearRampToValueAtTime(700, state.audio.currentTime + 1.2);
    tone.connect(state.volume);
    tone.start();
    tone.stop(state.audio.currentTime + 1.2);
}

function playOofSound() {
    if (state.soundMuted) {
        return;
    }

    const sound = new Audio("media/roblox-death-sound_1.mp3");
    sound.play().catch((error) => console.error("Could not play the Roblox sound.", error));
}

function showWarp() {
    const overlay = get(".hyperspace-transition");
    overlay.classList.add("is-visible");
    overlay.setAttribute("aria-hidden", "false");
}

function startEntrance() {
    const button = get(".start-experience");
    let dodges = 0;

    button.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch" || dodges >= 2) {
            return;
        }

        dodges += 1;
        button.style.setProperty("--dodge-x", `${Math.random() * 500 - 250}px`);
        button.style.setProperty("--dodge-y", `${Math.random() * 360 - 180}px`);
        button.classList.add("is-dodging");
    });

    button.addEventListener("click", () => {
        button.disabled = true;
        startAudio();
        showWarp();
        window.setTimeout(playWarpSound, 250);
        window.setTimeout(() => {
            window.location.href = "experience.html";
        }, reducedMotion.matches ? 2000 : 4000);
    }, { once: true });
}

function fillWordWall() {
    const wall = get("#word-wall");
    const words = ["brainscereal", "is", "this", "real"];

    for (let i = 0; i < 100; i += 1) {
        const word = document.createElement("button");
        word.className = "wall-word";
        word.type = "button";
        word.draggable = true;
        word.textContent = words[i % words.length];
        word.setAttribute("aria-label", `Eat the word ${word.textContent}`);
        wall.append(word);
    }

    function updateWordsLeft() {
        const left = wall.querySelectorAll(".wall-word").length;
        get("#words-left").textContent = `${left} words left`;
    }

    wall.addEventListener("click", (event) => {
        if (!event.target.classList.contains("wall-word")) {
            return;
        }

        event.target.remove();
        changeChaos(2);
        updateWordsLeft();
    });

    updateWordsLeft();
    window.setInterval(() => {
        const wordsLeft = wall.querySelectorAll(".wall-word");
        if (wordsLeft.length) {
            wordsLeft[Math.floor(Math.random() * wordsLeft.length)].remove();
            updateWordsLeft();
        }
    }, reducedMotion.matches ? 3000 : 1100);
}

function moveNoob(noob, x, y) {
    noob.style.left = `${Math.max(0, Math.min(x - noob.offsetWidth / 2, window.innerWidth - noob.offsetWidth))}px`;
    noob.style.top = `${Math.max(0, Math.min(y - noob.offsetHeight / 2, window.innerHeight - noob.offsetHeight))}px`;
}

function showRobinSpeed() {
    const robin = get(".robin-interaction");
    robin.classList.add("is-zooming");
    const maxLeft = Math.max(0, window.innerWidth - robin.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - robin.offsetHeight);
    robin.style.left = `${Math.random() * maxLeft}px`;
    robin.style.top = `${Math.random() * maxTop}px`;
    window.setTimeout(() => robin.classList.remove("is-zooming"), 5000);
}

function makeNoobFollowAndBounce() {
    const noob = get("#noob");
    let bouncing = false;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let animation;
    let bounceTimer;

    function finishBounce() {
        if (!bouncing) {
            return;
        }

        bouncing = false;
        cancelAnimationFrame(animation);
        window.clearTimeout(bounceTimer);
        noob.classList.remove("is-bouncing");
        noob.style.visibility = "visible";
        moveNoob(noob, pointerX - 80, pointerY - 60);
    }

    document.addEventListener("pointermove", (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!bouncing) {
            moveNoob(noob, event.clientX - 80, event.clientY - 60);
        }
    });

    document.addEventListener("click", () => {
        if (bouncing) {
            return;
        }

        bouncing = true;
        playOofSound();
        showRobinSpeed();
        noob.classList.add("is-bouncing");
        const bounds = noob.getBoundingClientRect();
        let x = bounds.left;
        let y = bounds.top;
        let speedX = (Math.random() < 0.5 ? -1 : 1) * (reducedMotion.matches ? 450 : 1500);
        let speedY = (Math.random() < 0.5 ? -1 : 1) * (reducedMotion.matches ? 450 : 1500);
        const startTime = performance.now();
        let previousTime = startTime;

        function bounce(time) {
            if (!bouncing) {
                return;
            }

            if (time - startTime >= 5000) {
                finishBounce();
                return;
            }

            const step = Math.min((time - previousTime) / 1000, 0.05);
            previousTime = time;
            x += speedX * step;
            y += speedY * step;

            if (x <= 0 || x >= window.innerWidth - noob.offsetWidth) {
                speedX *= -1;
            }
            if (y <= 0 || y >= window.innerHeight - noob.offsetHeight) {
                speedY *= -1;
            }

            x = Math.max(0, Math.min(x, window.innerWidth - noob.offsetWidth));
            y = Math.max(0, Math.min(y, window.innerHeight - noob.offsetHeight));
            moveNoob(noob, x + noob.offsetWidth / 2, y + noob.offsetHeight / 2);
            animation = requestAnimationFrame(bounce);
        }

        animation = requestAnimationFrame(bounce);
        bounceTimer = window.setTimeout(finishBounce, 5000);
    });
}

function addSticker(imagePath, description, className) {
    const button = document.createElement("button");
    const image = document.createElement("img");
    button.className = `chaos-sticker ${className}`;
    button.type = "button";
    button.setAttribute("aria-label", description);
    image.src = imagePath;
    image.alt = "";
    button.append(image);
    button.style.left = `${20 + Math.random() * Math.max(0, window.innerWidth - 120)}px`;
    button.style.top = `${100 + Math.random() * Math.max(0, window.innerHeight - 200)}px`;
    document.body.append(button);
    return button;
}

function dropButter() {
    for (let i = 0; i < 8; i += 1) {
        const butter = document.createElement("button");
        butter.className = "butter-drop";
        butter.type = "button";
        butter.draggable = true;
        butter.textContent = "🧈";
        butter.setAttribute("aria-label", "Butter dropped by the dog. Click to remove.");
        butter.style.left = `${20 + Math.random() * Math.max(0, window.innerWidth - 80)}px`;
        butter.style.top = `${Math.max(90, window.innerHeight - 90)}px`;
        butter.style.animationDelay = `${i * 0.08}s`;
        document.body.append(butter);
        butter.addEventListener("click", () => butter.remove(), { once: true });
    }
}

function showDog() {
    if (get(".dog-peek")) {
        return;
    }

    const dog = addSticker("media/buttrerdog.jpg", "Dog with butter on its head. Click to drop butter.", "dog-peek");
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) {
        dog.style.left = "0";
    } else if (edge === 1) {
        dog.style.left = "auto";
        dog.style.right = "0";
    } else if (edge === 2) {
        dog.style.top = "5rem";
    } else {
        dog.style.top = "auto";
        dog.style.bottom = "0";
    }

    dog.addEventListener("click", () => {
        dog.remove();
        dropButter();
        changeChaos(10);
    }, { once: true });
}

function makeBrainscerealSummonDog() {
    get(".brainscereal").addEventListener("click", (event) => {
        event.stopPropagation();

        const takeover = document.createElement("button");
        const dog = document.createElement("img");
        takeover.className = "dog-takeover";
        takeover.type = "button";
        takeover.setAttribute("aria-label", "Butter dog is covering the page. Click to close.");
        dog.src = "media/buttrerdog.jpg";
        dog.alt = "Butter dog";
        takeover.append(dog);
        document.body.append(takeover);
        takeover.addEventListener("click", () => takeover.remove(), { once: true });
    });
}

function startDogTimer() {
    window.setTimeout(() => {
        showDog();
        startDogTimer();
    }, 2000 + Math.random() * 2000);
}

function showSkull() {
    const skull = addSticker("media/gull.png", "Skull: you died. Click to dismiss.", "skull-pop");
    skull.addEventListener("click", () => skull.remove(), { once: true });
    updateDeaths();
}

function makeBackgroundClicksShowSkulls(scene) {
    scene.addEventListener("click", (event) => {
        if (event.target.closest("button, a, video, iframe")) {
            return;
        }
        if (Math.random() > 0.25) {
            return;
        }
        showSkull();
    });
}

function addVideoEvents(video, container) {
    let timer;

    function play() {
        video.play().catch((error) => console.warn("Could not play the video.", error));
        if (!timer) {
            timer = window.setInterval(() => {
                addVideoCopy(container);
            }, 1200);
        }
    }

    function pause() {
        window.clearInterval(timer);
        timer = null;
        video.pause();
    }

    video.addEventListener("pointerenter", play);
    video.addEventListener("pointerleave", pause);
    video.addEventListener("focus", play);
    video.addEventListener("blur", pause);
    video.addEventListener("click", () => {
        play();
        addVideoCopy(container);
    });
}

function addVideoCopy(container) {
    const copy = container.querySelector("video").cloneNode(true);
    copy.currentTime = 0;
    container.append(copy);
    changeChaos(6);
    addVideoEvents(copy, container);
    copy.play().catch((error) => console.warn("Could not play the extra video.", error));
}

function startJohnPorkCall() {
    const popup = get("#call-popup");
    const accept = get("#accept-call");
    const decline = get("#decline-call");
    const callVideo = get("#call-webcam");
    const callStatus = get("#call-camera-status");

    window.setTimeout(() => {
        if (state.callShown) {
            return;
        }
        state.callShown = true;
        popup.hidden = false;
        changeChaos(10);
        get("#accept-call").focus();
    }, 15000);

    accept.addEventListener("click", async () => {
        if (state.callShown && accept.textContent === "End call") {
            popup.hidden = true;
            callVideo.srcObject = null;
            if (state.camera) {
                state.camera.getTracks().forEach((track) => track.stop());
                state.camera = null;
            }
            accept.textContent = "Accept";
            decline.hidden = false;
            return;
        }

        accept.disabled = true;
        callStatus.textContent = "Connecting camera...";
        try {
            if (!state.camera) {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error("Camera is unavailable in this browser.");
                }
                state.camera = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            }
            callVideo.srcObject = state.camera;
            callStatus.textContent = "";
            get("#call-title").textContent = "You're on a call with John Pork";
           
            accept.textContent = "End call";
            decline.hidden = true;
            changeChaos(30);
            showSkull();
        } catch (error) {
            callStatus.textContent = `Camera unavailable: ${error.message}`;
            get("#call-title").textContent = "You're on a call with John Pork";
            accept.textContent = "End call";
            decline.hidden = true;
        } finally {
            accept.disabled = false;
        }
    });

    decline.addEventListener("click", () => {
        popup.hidden = true;
        changeChaos(10);
        showDog();
    });
}

function startResetButton() {
    const button = get("#reset-button");

    button.addEventListener("click", () => {
        button.disabled = true;
        showWarp();
        window.setTimeout(playWarpSound, 250);
        window.setTimeout(() => {
            window.location.reload();
        }, reducedMotion.matches ? 2000 : 2500);
    });
}

function startMuteButton() {
    const button = get("#mute-button");
    button.addEventListener("click", () => {
        state.soundMuted = !state.soundMuted;
        if (state.volume) {
            state.volume.gain.value = state.soundMuted ? 0 : 0.15;
        }
        button.textContent = state.soundMuted ? "Unmute sound" : "Mute sound";
        button.setAttribute("aria-pressed", state.soundMuted);
    });
}

function startExperience() {
    const scene = get("#scene");
    document.addEventListener("click", () => {
        state.clicks += 1;
        changeChaos(1);
        get("#click-count").textContent = state.clicks;
    });

    window.setInterval(cycleInterface, 5000);
    fillWordWall();
    makeNoobFollowAndBounce();
    makeBrainscerealSummonDog();
    makeBackgroundClicksShowSkulls(scene);
    document.querySelectorAll(".hover-video").forEach((video) => addVideoEvents(video, get("#video-container")));
    startDogTimer();
    startJohnPorkCall();
    startResetButton();
    startMuteButton();
    window.addEventListener("pagehide", () => {
        if (state.camera) {
            state.camera.getTracks().forEach((track) => track.stop());
        }
    });
}

if (get(".start-experience")) {
    startEntrance();
} else if (get("#scene")) {
    startExperience();
}
