/**
 * Main Interactive Application Script
 * Handcrafted for Ngọc Anh with love.
 */

// DOM Elements
const lockScreen = document.getElementById('lockScreen');
const mailboxScreen = document.getElementById('mailboxScreen');
const pinDisplay = document.getElementById('pinDisplay');
const pinSlots = document.querySelectorAll('.pin-slot');
const feedbackMsg = document.getElementById('feedbackMsg');
const backspaceBtn = document.getElementById('backspaceBtn');
const keyButtons = document.querySelectorAll('.key-btn[data-key]');

// Envelope & Letter Elements
const envelopeStage = document.getElementById('envelopeStage');
const envelope = document.getElementById('envelope');
const envFlap = document.getElementById('envFlap');
const letterPeek = document.getElementById('letterPeek');
const letterOverlay = document.getElementById('letterOverlay');
const parchmentLetter = document.getElementById('parchmentLetter');
const closeLetterBtn = document.getElementById('closeLetterBtn');
const letterBackdrop = document.getElementById('letterBackdrop');

// State
const SECRET_PASSCODE = '23012006';
let enteredPin = [];
let isVerifying = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  bindKeypadEvents();
  bindEnvelopeEvents();
});

/* ==========================================================
   PARTICLE CANVAS (Sakura Petals & Floating Glowing Hearts)
   ========================================================== */
function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 24), 36);

  class FloatingParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -30;
      this.size = Math.random() * 12 + 10;
      this.speedY = Math.random() * 1.1 + 0.7;
      this.speedX = Math.random() * 0.8 - 0.4;
      this.rotation = Math.random() * 360;
      this.rotSpeed = Math.random() * 2 - 1;
      this.isHeart = Math.random() > 0.45;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.swingOffset = Math.random() * 100;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin((this.y + this.swingOffset) * 0.015) * 0.8 + this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y > height + 40 || this.x < -40 || this.x > width + 40) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;

      if (this.isHeart) {
        ctx.fillStyle = '#ff758c';
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, (this.size + topCurveHeight) / 1.5, 0, this.size);
        ctx.bezierCurveTo(0, (this.size + topCurveHeight) / 1.5, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#ffccd5';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.6, this.size * 0.35, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new FloatingParticle());
  }

  const bursts = [];
  window.createBurst = function (x, y, count = 28) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      bursts.push({
        x: x || width / 2,
        y: y || height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: Math.random() * 18 + 12,
        alpha: 1,
        color: ['#ff4d80', '#ff758c', '#ffccd5', '#ffd166', '#ff85a1'][Math.floor(Math.random() * 5)],
        gravity: 0.12
      });
    }
  };

  window.createHeartsFountain = function (x, y, total = 35) {
    for (let i = 0; i < total; i++) {
      setTimeout(() => {
        const spreadX = (Math.random() - 0.5) * 80;
        bursts.push({
          x: x + spreadX,
          y: y,
          vx: (Math.random() - 0.5) * 3,
          vy: -(Math.random() * 5 + 3.5),
          size: Math.random() * 20 + 14,
          alpha: 1,
          color: ['#ff4d80', '#ff758c', '#ff85a1', '#f72585'][Math.floor(Math.random() * 4)],
          gravity: -0.04
        });
      }, i * 35);
    }
  };

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.update();
      p.draw();
    }

    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vy += b.gravity;
      b.alpha -= 0.012;

      if (b.alpha <= 0) {
        bursts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.font = b.size + 'px sans-serif';
      ctx.fillText('❤️', b.x, b.y);
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================
   PASSCODE SCREEN INTERACTIONS
   ========================================================== */
function bindKeypadEvents() {
  keyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const digit = btn.getAttribute('data-key');
      addPasscodeDigit(digit);
    });
  });

  if (backspaceBtn) {
    backspaceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      removePasscodeDigit();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (!lockScreen || !lockScreen.classList.contains('active')) return;

    if (e.key >= '0' && e.key <= '9') {
      addPasscodeDigit(e.key);
    } else if (e.key === 'Backspace') {
      removePasscodeDigit();
    }
  });
}

function addPasscodeDigit(digit) {
  if (isVerifying || enteredPin.length >= 8) return;

  if (feedbackMsg) feedbackMsg.textContent = '';

  enteredPin.push(digit);
  updatePinDisplay();

  if (enteredPin.length === 8) {
    verifyPasscode();
  }
}

function removePasscodeDigit() {
  if (isVerifying || enteredPin.length === 0) return;

  enteredPin.pop();
  updatePinDisplay();
  if (feedbackMsg) feedbackMsg.textContent = '';
}

function updatePinDisplay() {
  pinSlots.forEach((slot, index) => {
    if (index < enteredPin.length) {
      slot.classList.add('filled');
    } else {
      slot.classList.remove('filled');
    }
  });
}

function verifyPasscode() {
  isVerifying = true;
  const enteredString = enteredPin.join('');

  if (enteredString === SECRET_PASSCODE) {
    if (feedbackMsg) feedbackMsg.textContent = '';

    if (pinDisplay && window.createBurst) {
      const rect = pinDisplay.getBoundingClientRect();
      window.createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
    }

    setTimeout(() => {
      transitionToMailbox();
    }, 550);
  } else {
    if (pinDisplay) pinDisplay.classList.add('shake');
    if (feedbackMsg) {
      feedbackMsg.textContent = 'Hãy nhập lại';
      feedbackMsg.style.color = '#e02860';
    }

    setTimeout(() => {
      if (pinDisplay) pinDisplay.classList.remove('shake');
      enteredPin = [];
      updatePinDisplay();
      isVerifying = false;
    }, 800);
  }
}

function transitionToMailbox() {
  if (lockScreen) lockScreen.classList.remove('active');
  setTimeout(() => {
    if (mailboxScreen) mailboxScreen.classList.add('active');
  }, 350);
}

/* ==========================================================
   ENVELOPE & LETTER INTERACTIONS
   ========================================================== */
function bindEnvelopeEvents() {
  if (envelopeStage) envelopeStage.addEventListener('click', openEnvelope);
  if (closeLetterBtn) closeLetterBtn.addEventListener('click', closeLetter);
  if (letterBackdrop) letterBackdrop.addEventListener('click', closeLetter);
}

function openEnvelope() {
  if (!envelope) return;

  if (envelope.classList.contains('opened')) {
    openLetterModal();
    return;
  }

  if (envFlap) envFlap.classList.add('open');

  if (window.createHeartsFountain) {
    const envRect = envelope.getBoundingClientRect();
    const centerX = envRect.left + envRect.width / 2;
    const centerY = envRect.top + envRect.height * 0.45;
    window.createHeartsFountain(centerX, centerY, 35);
  }

  setTimeout(() => {
    if (letterPeek) letterPeek.style.transform = 'translateY(-65px)';
  }, 400);

  setTimeout(() => {
    envelope.classList.add('opened');
    openLetterModal();
  }, 850);
}

function openLetterModal() {
  const scrollArea = document.getElementById('letterScrollArea');
  if (scrollArea) scrollArea.scrollTop = 0;

  if (letterOverlay) letterOverlay.classList.add('show');
  if (parchmentLetter && window.createBurst) {
    const modalRect = parchmentLetter.getBoundingClientRect();
    window.createBurst(modalRect.left + modalRect.width / 2, modalRect.top + modalRect.height * 0.35, 25);
  }
}

function closeLetter() {
  if (letterOverlay) letterOverlay.classList.remove('show');
}
