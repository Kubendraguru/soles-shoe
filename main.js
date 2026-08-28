const TOTAL_FRAMES = 240;
const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const images = [];
let currentFrame = 0;
let targetFrame = 0;

// Generate frame URL (ezgif-frame-001.jpg to ezgif-frame-240.jpg)
function getFrameUrl(index) {
  const paddedNumber = String(index).padStart(3, '0');
  return `/frames-jpg/ezgif-frame-${paddedNumber}.jpg`;
}

// Adjust canvas resolution for high-DPI displays
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  renderFrame(Math.round(currentFrame));
}

// Fit image perfectly within viewport while maintaining aspect ratio
function drawImageContain(img) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = width / height;

  let renderW, renderH, renderX, renderY;

  if (canvasRatio > imgRatio) {
    renderH = height;
    renderW = height * imgRatio;
    renderX = (width - renderW) / 2;
    renderY = 0;
  } else {
    renderW = width;
    renderH = width / imgRatio;
    renderX = 0;
    renderY = (height - renderH) / 2;
  }

  // Clear background with dark fill
  ctx.fillStyle = '#0a0a0e';
  ctx.fillRect(0, 0, width, height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, renderX, renderY, renderW, renderH);
}

// Render frame by index
function renderFrame(frameIndex) {
  const index = Math.min(TOTAL_FRAMES - 1, Math.max(0, frameIndex));
  const img = images[index];
  if (img && img.complete && img.naturalWidth !== 0) {
    drawImageContain(img);
  }
}

// Calculate target frame from current scroll offset
function updateTargetFrame() {
  const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  const maxScroll = Math.max(
    1,
    (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight
  );

  const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
  targetFrame = scrollFraction * (TOTAL_FRAMES - 1);
}

// Smooth continuous animation loop
function animationLoop() {
  updateTargetFrame();

  const diff = targetFrame - currentFrame;
  if (Math.abs(diff) > 0.01) {
    // 0.15 gives fast, smooth responsiveness
    currentFrame += diff * 0.15;
    renderFrame(Math.round(currentFrame));
  } else if (currentFrame !== targetFrame) {
    currentFrame = targetFrame;
    renderFrame(Math.round(currentFrame));
  }

  requestAnimationFrame(animationLoop);
}

// Preload frames
function preloadFrames() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);
    if (i === 1) {
      img.onload = () => {
        renderFrame(0);
      };
    }
    images.push(img);
  }
}

// Event Listeners
window.addEventListener('scroll', updateTargetFrame, { passive: true });
window.addEventListener('resize', () => {
  resizeCanvas();
  updateTargetFrame();
});

// Initialize
preloadFrames();
resizeCanvas();
updateTargetFrame();
requestAnimationFrame(animationLoop);
