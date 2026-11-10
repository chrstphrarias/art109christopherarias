const sceneFrame = document.querySelector(".scene-frame");
const apple = document.querySelector("#apple");
const duck = document.querySelector("#duck");
const quackSound = document.querySelector("#quack-sound");
const svg = apple.ownerSVGElement;
const restingApplePosition = { x: -64, y: 112, rotation: 540 };
const appleSnapDistance = 48;
let applePosition = { x: 0, y: 0 };
let dragState = null;
let suppressClick = false;

function setAppleTransform(x, y, rotation) {
  const scale = Number(apple.getAttribute("width")) / apple.viewBox.baseVal.width;
  const sceneWidth = svg.viewBox.baseVal.width;
  const sceneHeight = svg.viewBox.baseVal.height;
  apple.style.transform = `translate(${x * scale / sceneWidth * 100}%, ${y * scale / sceneHeight * 100}%) rotate(${rotation}deg)`;
}

function dropApple() {
  if (sceneFrame.classList.contains("is-dropping")
    || sceneFrame.classList.contains("is-bouncing")
    || sceneFrame.classList.contains("is-landed")) return;

  sceneFrame.classList.remove("is-asleep");
  sceneFrame.classList.add("is-dropping");
  apple.setAttribute("aria-disabled", "true");
  apple.setAttribute("aria-label", "The apple is falling");
}

function resetScene() {
  sceneFrame.classList.remove("is-dropping", "is-bouncing", "is-landed", "is-awake");
  sceneFrame.classList.add("is-asleep");
  svg.insertBefore(apple, duck);
  apple.classList.remove("is-dragging");
  apple.style.removeProperty("transform");
  applePosition = { x: 0, y: 0 };
  apple.removeAttribute("aria-disabled");
  apple.setAttribute("aria-label", "Drop the apple to wake the duck");
  duck.setAttribute("aria-label", "Sleeping duck");
}

function toScenePoint(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

apple.addEventListener("pointerdown", (event) => {
  if (!sceneFrame.classList.contains("is-landed")) return;

  event.preventDefault();
  const point = toScenePoint(event);
  dragState = {
    pointerId: event.pointerId,
    startX: point.x,
    startY: point.y,
    startAppleX: applePosition.x,
    startAppleY: applePosition.y,
    x: applePosition.x,
    y: applePosition.y,
    moved: false,
  };
  svg.append(apple);
  apple.classList.add("is-dragging");
  setAppleTransform(dragState.x, dragState.y, restingApplePosition.rotation);
  apple.setPointerCapture(event.pointerId);
});

apple.addEventListener("pointermove", (event) => {
  if (!dragState || dragState.pointerId !== event.pointerId) return;

  const point = toScenePoint(event);
  const appleScale = Number(apple.getAttribute("width")) / apple.viewBox.baseVal.width;
  dragState.x = dragState.startAppleX + (point.x - dragState.startX) / appleScale;
  dragState.y = dragState.startAppleY + (point.y - dragState.startY) / appleScale;
  dragState.moved ||= Math.abs(point.x - dragState.startX) > 3 || Math.abs(point.y - dragState.startY) > 3;
  setAppleTransform(dragState.x, dragState.y, restingApplePosition.rotation);
});

function finishDrag(event) {
  if (!dragState || dragState.pointerId !== event.pointerId) return;

  const { x, y, moved } = dragState;
  dragState = null;
  apple.classList.remove("is-dragging");
  if (apple.hasPointerCapture(event.pointerId)) apple.releasePointerCapture(event.pointerId);

  if (!moved) {
    return;
  }

  suppressClick = true;
  window.setTimeout(() => {
    suppressClick = false;
  }, 0);

  applePosition = { x, y };

  if (Math.abs(x) < appleSnapDistance && Math.abs(y) < appleSnapDistance) {
    resetScene();
    return;
  }

  setAppleTransform(x, y, restingApplePosition.rotation);
}

apple.addEventListener("pointerup", finishDrag);
apple.addEventListener("pointercancel", finishDrag);
apple.addEventListener("click", (event) => {
  if (suppressClick) {
    event.preventDefault();
    return;
  }
  dropApple();
});

apple.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (sceneFrame.classList.contains("is-landed")) resetScene();
    else dropApple();
  }
});

apple.addEventListener("animationend", (event) => {
  if (event.target !== apple) return;

  if (event.animationName === "apple-fall") {
    sceneFrame.classList.remove("is-dropping");
    svg.insertBefore(apple, duck);
    setAppleTransform(16, 48, 180);
    sceneFrame.classList.add("is-awake", "is-bouncing");
    duck.setAttribute("aria-label", "Awake duck");
  }

  if (event.animationName === "apple-bounce") {
    sceneFrame.classList.remove("is-bouncing");
    sceneFrame.classList.add("is-landed");
    applePosition = { ...restingApplePosition };
    setAppleTransform(restingApplePosition.x, restingApplePosition.y, restingApplePosition.rotation);
    apple.removeAttribute("aria-disabled");
    apple.setAttribute("aria-label", "Drag the apple back to the tree to reset");
  }
});

duck.addEventListener("animationstart", (event) => {
  if (event.animationName !== "duck-bonk" || !sceneFrame.classList.contains("is-dropping")) return;

  quackSound.currentTime = 0;
  quackSound.play().catch((error) => {
    console.error("Could not play the duck impact sound.", error);
  });
});
