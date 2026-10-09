/**
 * FLAPPY PLANE — City Skyscraper Flight
 * Features:
 * - Gentle Dynamic Wind Currents & Visible Wind Streaks
 * - Detailed Start Briefing Card (Controls, Close Calls, Shields, Winds, Length)
 * - Dynamic Day -> Sunset -> Night Sky Transitions
 * - Ghost Personal Best Record Marker with New Record Fanfare
 * - "Close Call" Near-Miss Bonus (+2 pts & golden sparks)
 * - Collectible Floating Stars (+3 pts) & Rare Shield Bubble (1-hit crash protection)
 * - Plane Length stretches +12% every 10 points
 * - Screen Shake & Synthesized Audio Polish
 * - Full-width laptop & Android responsive
 * - Persistent Leaderboard & Callsign saved once
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let W = 800;
let H = 500;
let GROUND_Y = 440;

// ─────────────────────────────────────────────────────────────
// Audio System (Synthesized Web Audio API)
// ─────────────────────────────────────────────────────────────
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  flap() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.09);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  score() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.setValueAtTime(987.77, now + 0.07);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  star() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.06);
    osc.frequency.setValueAtTime(1046.50, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.29);
  }

  closeCall() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  shieldPickup() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [330, 440, 554, 659];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.05);
      gain.gain.setValueAtTime(0.18, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.01, now + i * 0.05 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.19);
    });
  }

  shieldBreak() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.24);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  stretch() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.3);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  newRecord() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.09);
      gain.gain.setValueAtTime(0.26, now + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.01, now + i * 0.09 + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.29);
    });
  }

  hit() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.28);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.29);
  }
}

const sounds = new SoundManager();

const soundToggleBtn = document.getElementById('soundToggle');
if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    sounds.init();
    sounds.muted = !sounds.muted;
    soundToggleBtn.textContent = sounds.muted ? '🔇' : '🔊';
  });
}

// ─────────────────────────────────────────────────────────────
// Leaderboard & Callsign Storage System
// ─────────────────────────────────────────────────────────────
const LeaderboardSystem = {
  getPilotName() {
    return localStorage.getItem('flappy_pilot_name') || '';
  },

  setPilotName(name) {
    const cleaned = (name || '').trim().toUpperCase().slice(0, 12) || 'PILOT';
    localStorage.setItem('flappy_pilot_name', cleaned);
    const display = document.getElementById('pilotNameDisplay');
    if (display) display.textContent = cleaned;
    return cleaned;
  },

  getScores() {
    try {
      return JSON.parse(localStorage.getItem('flappy_leaderboard') || '[]');
    } catch {
      return [];
    }
  },

  recordScore(score, planeLenPct) {
    if (score <= 0) return;
    const name = this.getPilotName() || 'PILOT';
    const list = this.getScores();
    const now = new Date();
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

    list.push({
      name,
      score,
      planeLen: `+${planeLenPct}%`,
      date: dateStr,
      timestamp: Date.now()
    });

    list.sort((a, b) => b.score - a.score);
    const top10 = list.slice(0, 10);
    localStorage.setItem('flappy_leaderboard', JSON.stringify(top10));
    return top10;
  },

  clearScores() {
    localStorage.removeItem('flappy_leaderboard');
  }
};

// ─────────────────────────────────────────────────────────────
// Airplane Entity (Length scales with score intervals + Shield)
// ─────────────────────────────────────────────────────────────
class Plane {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.max(90, Math.round(W * 0.22));
    this.y = H * 0.45;
    this.vy = 0;
    this.gravity = 720;
    this.jumpStrength = -260;
    this.angle = 0;
    this.propellerAngle = 0;
    this.hoverTime = 0;
    this.lengthScale = 1.0;
    this.hasShield = false;
    this.shieldPulse = 0;
    this.invulnerableTimer = 0;
    this.smokeParticles = [];
  }

  setScoreTier(score) {
    const tier = Math.floor(score / 10);
    this.lengthScale = 1.0 + tier * 0.12; // +12% per 10 points
  }

  jump() {
    this.vy = this.jumpStrength;
    sounds.flap();
  }

  update(dt, isPlaying, windForce = 0) {
    this.propellerAngle += dt * 38;
    this.shieldPulse += dt * 5;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    if (!isPlaying) {
      this.hoverTime += dt * 4;
      this.y = H * 0.45 + Math.sin(this.hoverTime) * 14;
      this.angle = Math.sin(this.hoverTime) * 0.08;
      return;
    }

    // Apply gravity + gentle vertical wind force
    this.vy += (this.gravity + windForce) * dt;
    this.y += this.vy * dt;

    if (this.vy < 0) {
      this.angle = -0.32;
    } else {
      this.angle = Math.min(Math.PI / 2.3, this.angle + dt * 2.8);
    }

    // Engine smoke puff trail
    if (Math.random() < 0.45) {
      this.smokeParticles.push({
        x: this.x - 18 * this.lengthScale,
        y: this.y + 2,
        r: 3 + Math.random() * 3,
        alpha: 0.65,
        vx: -60 - Math.random() * 30,
        vy: (Math.random() - 0.5) * 18
      });
    }

    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += dt * 5;
      p.alpha -= dt * 1.6;
      if (p.alpha <= 0) this.smokeParticles.splice(i, 1);
    }
  }

  draw(ctx) {
    // Smoke trail
    ctx.save();
    this.smokeParticles.forEach(p => {
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer * 12) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    ctx.rotate(this.angle);

    const s = this.lengthScale;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 11, 16 * s, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Fuselage
    ctx.fillStyle = '#ff3344';
    ctx.beginPath();
    ctx.moveTo(18 * s, 0);
    ctx.bezierCurveTo(18 * s, -9, 8 * s, -11, -12 * s, -10);
    ctx.lineTo(-20 * s, -6);
    ctx.lineTo(-20 * s, 4);
    ctx.bezierCurveTo(-10 * s, 10, 8 * s, 9, 18 * s, 0);
    ctx.closePath();
    ctx.fill();

    // White belly accent stripe
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(14 * s, 2);
    ctx.bezierCurveTo(8 * s, 7, -8 * s, 8, -18 * s, 4);
    ctx.lineTo(-18 * s, 1);
    ctx.bezierCurveTo(-8 * s, 5, 8 * s, 4, 14 * s, 2);
    ctx.closePath();
    ctx.fill();

    // 2. Cockpit Canopy Glass
    ctx.fillStyle = '#68d8d6';
    ctx.beginPath();
    ctx.ellipse(3 * s, -5, 6 * s, 4.5, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(4 * s, -6, 2, 0, Math.PI * 2);
    ctx.fill();

    // 3. Tail Rudder
    ctx.fillStyle = '#ffbb00';
    ctx.beginPath();
    ctx.moveTo(-14 * s, -8);
    ctx.lineTo(-22 * s, -18);
    ctx.lineTo(-25 * s, -18);
    ctx.lineTo(-20 * s, -5);
    ctx.closePath();
    ctx.fill();

    // 4. Main Wing
    ctx.fillStyle = '#ffbb00';
    ctx.beginPath();
    ctx.moveTo(4 * s, 2);
    ctx.lineTo(-8 * s, 12);
    ctx.lineTo(-14 * s, 12);
    ctx.lineTo(-4 * s, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(2 * s, 2);
    ctx.lineTo(-7 * s, 11);
    ctx.stroke();

    // 5. Nose Engine
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.ellipse(18 * s, 0, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Spinning Propeller
    ctx.save();
    ctx.translate(21 * s, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2.5;
    const propLen = 14;
    const pSin = Math.sin(this.propellerAngle);
    ctx.beginPath();
    ctx.moveTo(0, -propLen * pSin);
    ctx.lineTo(0, propLen * pSin);
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();

    // 7. Shield Bubble Aura
    if (this.hasShield) {
      ctx.save();
      ctx.translate(this.x, this.y);
      const shieldR = 26 * s + Math.sin(this.shieldPulse) * 2;
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 242, 254, 0.16)';
      ctx.beginPath();
      ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  getBounds() {
    const s = this.lengthScale;
    return {
      left: this.x - 14 * s,
      right: this.x + 14 * s,
      top: this.y - 10,
      bottom: this.y + 10
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Building Obstacles (Skyscrapers + Pickups + Ghost Best Marker)
// ─────────────────────────────────────────────────────────────
class BuildingPair {
  constructor(x, index, isBestRecordBuilding) {
    this.x = x;
    this.index = index;
    this.isBestRecordBuilding = isBestRecordBuilding;
    this.width = Math.min(74, Math.max(58, Math.round(W * 0.08)));
    this.gap = Math.min(170, Math.max(150, Math.round(H * 0.32)));
    this.speed = Math.max(145, Math.min(180, W * 0.22));
    this.passed = false;
    this.closeCallAwarded = false;

    const minCenter = 110;
    const maxCenter = GROUND_Y - 110;
    this.gapCenter = Math.floor(Math.random() * (maxCenter - minCenter)) + minCenter;

    this.topHeight = Math.max(40, this.gapCenter - this.gap / 2);
    this.bottomY = this.gapCenter + this.gap / 2;
    this.bottomHeight = Math.max(40, GROUND_Y - this.bottomY);

    const themes = [
      { body: '#2b4162', border: '#436188', window: '#fff275', altWindow: '#70d6ff' },
      { body: '#385072', border: '#4e6d99', window: '#ffd166', altWindow: '#a0c4ff' },
      { body: '#243750', border: '#3b5577', window: '#ffee88', altWindow: '#90e0ef' }
    ];
    this.theme = themes[Math.floor(Math.random() * themes.length)];

    this.topWindows = this.generateWindows(this.topHeight);
    this.bottomWindows = this.generateWindows(this.bottomHeight);

    this.item = null;
    const rand = Math.random();
    if (rand < 0.35) {
      this.item = { type: 'STAR', active: true, rot: 0 };
    } else if (rand < 0.46) {
      this.item = { type: 'SHIELD', active: true, rot: 0 };
    }
  }

  generateWindows(height) {
    const windows = [];
    const rows = Math.floor(height / 24);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 3; c++) {
        windows.push({
          row: r,
          col: c,
          lit: Math.random() > 0.32,
          colorIndex: Math.random() > 0.5 ? 0 : 1
        });
      }
    }
    return windows;
  }

  update(dt) {
    this.x -= this.speed * dt;
    if (this.item && this.item.active) {
      this.item.rot += dt * 3.5;
    }
  }

  draw(ctx, nightMode) {
    // Ghost Record Marker Line
    if (this.isBestRecordBuilding) {
      ctx.save();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.topHeight);
      ctx.lineTo(this.x + this.width / 2, this.bottomY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffd700';
      ctx.font = '900 12px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑 BEST RECORD', this.x + this.width / 2, this.topHeight + 18);
      ctx.restore();
    }

    // Skyscrapers
    this.drawSkyscraper(ctx, this.x, 0, this.width, this.topHeight, true, nightMode);
    this.drawSkyscraper(ctx, this.x, this.bottomY, this.width, this.bottomHeight, false, nightMode);

    // Collectable in gap
    if (this.item && this.item.active) {
      this.drawItem(ctx, this.x + this.width / 2, this.gapCenter);
    }
  }

  drawItem(ctx, ix, iy) {
    ctx.save();
    ctx.translate(ix, iy);
    ctx.rotate(this.item.rot);

    if (this.item.type === 'STAR') {
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      const spikes = 5;
      const outerR = 14;
      const innerR = 7;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      ctx.moveTo(0, -outerR);
      for (let i = 0; i < spikes; i++) {
        let x = Math.cos(rot) * outerR;
        let y = Math.sin(rot) * outerR;
        ctx.lineTo(x, y);
        rot += step;
        x = Math.cos(rot) * innerR;
        y = Math.sin(rot) * innerR;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(0, -outerR);
      ctx.closePath();
      ctx.fill();
    } else if (this.item.type === 'SHIELD') {
      ctx.fillStyle = 'rgba(0, 242, 254, 0.35)';
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛡️', 0, 5);
    }

    ctx.restore();
  }

  drawSkyscraper(ctx, x, y, w, h, isTop, nightMode) {
    if (h <= 0) return;

    ctx.save();

    ctx.fillStyle = nightMode ? '#172338' : this.theme.body;
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = this.theme.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    const ledgeY = isTop ? y + h - 8 : y;
    ctx.fillStyle = '#1c293d';
    ctx.fillRect(x - 3, ledgeY, w + 6, 8);
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 3, ledgeY, w + 6, 8);

    const beaconX = x + w / 2;
    const beaconY = isTop ? y + h : y;
    ctx.fillStyle = '#ff2244';
    ctx.shadowColor = '#ff2244';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(beaconX, beaconY + (isTop ? -3 : 3), 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    const winList = isTop ? this.topWindows : this.bottomWindows;
    const startY = isTop ? y + 10 : y + 16;
    const colSpacing = (w - 18) / 3;

    winList.forEach(win => {
      const wx = x + 8 + win.col * colSpacing;
      const wy = startY + win.row * 24;
      if (wy + 14 < y + h - 12 && wy > y + 6) {
        if (win.lit) {
          ctx.fillStyle = win.colorIndex === 0 ? this.theme.window : this.theme.altWindow;
          ctx.fillRect(wx, wy, Math.min(12, colSpacing - 4), 14);
        } else {
          ctx.fillStyle = 'rgba(12, 20, 34, 0.7)';
          ctx.fillRect(wx, wy, Math.min(12, colSpacing - 4), 14);
        }
      }
    });

    ctx.restore();
  }

  collidesWith(bounds) {
    if (bounds.right > this.x && bounds.left < this.x + this.width) {
      if (bounds.top < this.topHeight) return true;
      if (bounds.bottom > this.bottomY) return true;
    }
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Dynamic Sky Environment (Day -> Sunset -> Night)
// ─────────────────────────────────────────────────────────────
class CityEnvironment {
  constructor() {
    this.groundOffset = 0;
    this.skylineOffset = 0;
    this.bgBuildings = [];
    this.clouds = [];
    this.stars = [];
    this.initBackdrop();
  }

  initBackdrop() {
    this.bgBuildings = [];
    let curX = 0;
    while (curX < 2400) {
      const bw = 40 + Math.random() * 55;
      const bh = 100 + Math.random() * 160;
      this.bgBuildings.push({ x: curX, w: bw, h: bh });
      curX += bw + 10;
    }

    this.clouds = [
      { x: 60,   y: 50,  scale: 1.1, speed: 14 },
      { x: 300,  y: 90,  scale: 0.8, speed: 10 },
      { x: 580,  y: 40,  scale: 1.3, speed: 16 },
      { x: 860,  y: 110, scale: 0.9, speed: 12 },
      { x: 1140, y: 65,  scale: 1.0, speed: 15 }
    ];

    this.stars = [];
    for (let i = 0; i < 45; i++) {
      this.stars.push({
        x: Math.random() * 1800,
        y: Math.random() * (H * 0.55),
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random()
      });
    }
  }

  update(dt, isMoving, scrollSpeed) {
    if (isMoving) {
      this.groundOffset = (this.groundOffset + scrollSpeed * dt) % 28;
      this.skylineOffset = (this.skylineOffset + scrollSpeed * 0.25 * dt) % 2400;
    }

    this.clouds.forEach(c => {
      c.x -= c.speed * dt;
      if (c.x < -140) c.x = W + 60;
    });
  }

  draw(ctx, score) {
    const isDay = score < 15;
    const isSunset = score >= 15 && score < 30;

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    if (isDay) {
      skyGrad.addColorStop(0, '#3a8fe8');
      skyGrad.addColorStop(0.5, '#68b5ff');
      skyGrad.addColorStop(0.85, '#a8d8fc');
      skyGrad.addColorStop(1, '#dff1fe');
    } else if (isSunset) {
      skyGrad.addColorStop(0, '#78286a');
      skyGrad.addColorStop(0.35, '#d35400');
      skyGrad.addColorStop(0.75, '#f39c12');
      skyGrad.addColorStop(1, '#fde3a7');
    } else {
      skyGrad.addColorStop(0, '#0a1128');
      skyGrad.addColorStop(0.55, '#142143');
      skyGrad.addColorStop(0.9, '#1f3560');
      skyGrad.addColorStop(1, '#2c4a80');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, GROUND_Y);

    // Sun / Moon
    ctx.save();
    if (isDay) {
      const sunGrad = ctx.createRadialGradient(W - 120, 70, 8, W - 120, 70, 65);
      sunGrad.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
      sunGrad.addColorStop(0.3, 'rgba(255, 235, 160, 0.6)');
      sunGrad.addColorStop(1, 'rgba(255, 240, 200, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(W - 120, 70, 65, 0, Math.PI * 2);
      ctx.fill();
    } else if (isSunset) {
      const sunGrad = ctx.createRadialGradient(W - 140, 110, 12, W - 140, 110, 80);
      sunGrad.addColorStop(0, 'rgba(255, 245, 180, 0.95)');
      sunGrad.addColorStop(0.4, 'rgba(255, 120, 60, 0.7)');
      sunGrad.addColorStop(1, 'rgba(255, 80, 40, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(W - 140, 110, 80, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      this.stars.forEach(st => {
        ctx.beginPath();
        ctx.arc(st.x % W, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#f1f2f6';
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(W - 110, 65, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 2. Clouds
    const cloudColor = isDay ? 'rgba(255, 255, 255, 0.88)' : isSunset ? 'rgba(255, 210, 190, 0.75)' : 'rgba(80, 110, 150, 0.4)';
    ctx.fillStyle = cloudColor;
    this.clouds.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.arc(16, -8, 22, 0, Math.PI * 2);
      ctx.arc(36, 0, 17, 0, Math.PI * 2);
      ctx.arc(18, 8, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Distant City Skyline Silhouettes
    ctx.fillStyle = isDay ? '#6e98b8' : isSunset ? '#6b2d42' : '#141d30';
    this.bgBuildings.forEach(b => {
      const bx = ((b.x - this.skylineOffset) % 2400) - 60;
      if (bx > -100 && bx < W + 100) {
        ctx.fillRect(bx, GROUND_Y - b.h, b.w, b.h);
        ctx.fillRect(bx + b.w / 2 - 1, GROUND_Y - b.h - 14, 2, 14);
      }
    });

    // 4. Ground Road / Boulevard
    ctx.fillStyle = '#323d4f';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

    ctx.fillStyle = isSunset ? '#d35400' : '#48bb78';
    ctx.fillRect(0, GROUND_Y, W, 7);

    ctx.fillStyle = '#52627a';
    ctx.fillRect(0, GROUND_Y + 7, W, 4);

    ctx.fillStyle = '#f6e05e';
    for (let x = -this.groundOffset; x < W + 30; x += 36) {
      ctx.fillRect(x, GROUND_Y + 28, 20, 5);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Game Core Controller & State Loop
// ─────────────────────────────────────────────────────────────
class Game {
  constructor() {
    this.plane = new Plane();
    this.env = new CityEnvironment();
    this.buildings = [];
    this.popups = [];
    this.particles = [];
    this.windParticles = [];
    this.state = 'START';
    this.score = 0;
    this.bestScore = 0;
    this.buildingSpawnTimer = 0;
    this.buildingInterval = 1.7;
    this.restartCooldown = 0;
    this.buildingCounter = 0;
    this.newRecordTriggered = false;
    this.screenShake = 0;

    // Gentle wind state (each phase lasts 5-10 seconds!)
    this.windPhaseTimer = 7.0;
    this.targetWindForce = 0;
    this.windForce = 0;

    this.banner = { text: '', timer: 0 };

    this.initWindParticles();
    this.initPilotAndBest();
    this.bindInputs();
    this.bindUI();
  }

  initWindParticles() {
    this.windParticles = [];
    for (let i = 0; i < 22; i++) {
      this.windParticles.push({
        x: Math.random() * (W || 800),
        y: 40 + Math.random() * (GROUND_Y - 70),
        len: 26 + Math.random() * 38,
        speed: 160 + Math.random() * 90,
        alpha: 0.18 + Math.random() * 0.25
      });
    }
  }

  initPilotAndBest() {
    const scores = LeaderboardSystem.getScores();
    if (scores.length > 0) {
      this.bestScore = scores[0].score;
    }

    const savedName = LeaderboardSystem.getPilotName();
    const display = document.getElementById('pilotNameDisplay');
    if (savedName) {
      if (display) display.textContent = savedName;
    } else {
      this.openNameModal();
    }
  }

  bindUI() {
    const pilotBtn = document.getElementById('pilotBadge');
    if (pilotBtn) {
      pilotBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openNameModal();
      });
    }

    const saveNameBtn = document.getElementById('saveNameBtn');
    const nameInput = document.getElementById('playerNameInput');
    if (saveNameBtn && nameInput) {
      const saveAction = () => {
        const val = nameInput.value.trim() || 'ACE';
        LeaderboardSystem.setPilotName(val);
        this.closeNameModal();
      };
      saveNameBtn.addEventListener('click', saveAction);
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveAction();
      });
    }

    const lbBtn = document.getElementById('leaderboardBtn');
    if (lbBtn) {
      lbBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openLeaderboardModal();
      });
    }

    const closeLbBtn = document.getElementById('closeLeaderboardBtn');
    const closeLbBtnBottom = document.getElementById('closeLeaderboardBtnBottom');
    if (closeLbBtn) closeLbBtn.addEventListener('click', () => this.closeLeaderboardModal());
    if (closeLbBtnBottom) closeLbBtnBottom.addEventListener('click', () => this.closeLeaderboardModal());

    const clearBtn = document.getElementById('clearLeaderboardBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Reset all high scores on the leaderboard?')) {
          LeaderboardSystem.clearScores();
          this.bestScore = 0;
          this.renderLeaderboardTable();
        }
      });
    }
  }

  openNameModal() {
    const modal = document.getElementById('nameModal');
    const input = document.getElementById('playerNameInput');
    if (modal) {
      modal.classList.add('active');
      if (input) {
        input.value = LeaderboardSystem.getPilotName() || '';
        setTimeout(() => input.focus(), 100);
      }
    }
  }

  closeNameModal() {
    const modal = document.getElementById('nameModal');
    if (modal) modal.classList.remove('active');
  }

  openLeaderboardModal() {
    this.renderLeaderboardTable();
    const modal = document.getElementById('leaderboardModal');
    if (modal) modal.classList.add('active');
  }

  closeLeaderboardModal() {
    const modal = document.getElementById('leaderboardModal');
    if (modal) modal.classList.remove('active');
  }

  renderLeaderboardTable() {
    const tbody = document.getElementById('leaderboardBody');
    const emptyMsg = document.getElementById('emptyLeaderboardMsg');
    if (!tbody) return;

    tbody.innerHTML = '';
    const scores = LeaderboardSystem.getScores();

    if (scores.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    scores.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
      tr.innerHTML = `
        <td><span class="rank-pill ${rankClass}">#${idx + 1}</span></td>
        <td style="font-weight:700; color:#00d2ff;">${entry.name}</td>
        <td style="font-weight:900; color:#ffd700; font-size:1.05rem;">${entry.score}</td>
        <td style="color:#a0c4ff;">${entry.planeLen || '+0%'}</td>
        <td style="color:#7a9ec7; font-size:0.8rem;">${entry.date || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  bindInputs() {
    const handleAction = (e) => {
      if (document.querySelector('.modal-overlay.active')) return;

      sounds.init();
      if (e) {
        if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp' && e.code !== 'KeyW') {
          return;
        }
        if (e.cancelable) e.preventDefault();
      }

      if (this.state === 'START') {
        this.state = 'PLAYING';
        this.plane.jump();
      } else if (this.state === 'PLAYING') {
        this.plane.jump();
      } else if (this.state === 'GAMEOVER') {
        if (this.restartCooldown <= 0) {
          this.resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleAction);
    canvas.addEventListener('pointerdown', handleAction);
  }

  resetGame() {
    this.plane.reset();
    this.plane.x = Math.max(90, Math.round(W * 0.22));
    this.buildings = [];
    this.popups = [];
    this.particles = [];
    this.score = 0;
    this.buildingCounter = 0;
    this.newRecordTriggered = false;
    this.buildingSpawnTimer = 0.6;
    this.banner = { text: '', timer: 0 };
    this.screenShake = 0;
    this.windPhaseTimer = 6.0 + Math.random() * 3.0; // 6 to 9 seconds
    this.targetWindForce = 0;
    this.windForce = 0;
    this.state = 'START';
  }

  triggerGameOver() {
    sounds.hit();
    this.state = 'GAMEOVER';
    this.restartCooldown = 0.55;
    this.screenShake = 12;

    const tier = Math.floor(this.score / 10);
    const planeLenPct = tier * 12;
    LeaderboardSystem.recordScore(this.score, planeLenPct);

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }
  }

  addPopup(x, y, text, color = '#ffd700') {
    this.popups.push({
      x, y, text, color,
      life: 0.85,
      maxLife: 0.85,
      vy: -45
    });
  }

  burstParticles(x, y, color = '#ffd700', count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: 2.5 + Math.random() * 3,
        life: 0.55,
        maxLife: 0.55
      });
    }
  }

  update(dt) {
    if (this.restartCooldown > 0) this.restartCooldown -= dt;
    if (this.banner.timer > 0) this.banner.timer -= dt;
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 25);

    // Wind Phase System: each wind phase stays consistent for 5 to 10 seconds!
    this.windPhaseTimer -= dt;
    if (this.windPhaseTimer <= 0) {
      // Pick random duration between 6.0 and 10.0 seconds
      this.windPhaseTimer = 6.0 + Math.random() * 4.0;

      // Choose next wind phase: Updraft, Downdraft, or Calm
      const modes = ['CALM', 'UP', 'DOWN'];
      const nextMode = modes[Math.floor(Math.random() * modes.length)];

      const windMax = this.score < 10 ? 26 : this.score < 25 ? 46 : 68;

      if (nextMode === 'UP') {
        this.targetWindForce = -windMax; // gentle upward push
      } else if (nextMode === 'DOWN') {
        this.targetWindForce = windMax;  // gentle downward push
      } else {
        this.targetWindForce = 0;        // calm
      }
    }

    // Smoothly transition towards target wind over ~2 seconds
    this.windForce += (this.targetWindForce - this.windForce) * dt * 1.5;

    // Update visual wind streaks
    this.windParticles.forEach(wp => {
      wp.x -= wp.speed * dt;
      wp.y += (this.windForce * 0.12) * dt;
      if (wp.x < -80) {
        wp.x = W + 40;
        wp.y = 40 + Math.random() * (GROUND_Y - 70);
      }
    });

    // Update Popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.life -= dt;
      p.y += p.vy * dt;
      if (p.life <= 0) this.popups.splice(i, 1);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 120 * dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    const isPlaying = this.state === 'PLAYING';
    const scrollSpeed = Math.max(145, Math.min(180, W * 0.22));
    this.env.update(dt, isPlaying, scrollSpeed);
    this.plane.update(dt, isPlaying, this.windForce);

    if (this.state === 'START') return;

    if (this.state === 'PLAYING') {
      this.buildingSpawnTimer += dt;
      if (this.buildingSpawnTimer >= this.buildingInterval) {
        this.buildingSpawnTimer = 0;
        this.buildingCounter++;
        const isBestBuilding = this.bestScore > 0 && this.buildingCounter === this.bestScore;
        this.buildings.push(new BuildingPair(W + 40, this.buildingCounter, isBestBuilding));
      }

      const bounds = this.plane.getBounds();

      for (let i = this.buildings.length - 1; i >= 0; i--) {
        const b = this.buildings[i];
        b.update(dt);

        // 1. Scoring
        if (!b.passed && b.x + b.width < this.plane.x) {
          b.passed = true;
          this.score++;
          sounds.score();

          // Ghost Best Record Milestone crossed!
          if (this.bestScore > 0 && this.score > this.bestScore && !this.newRecordTriggered) {
            this.newRecordTriggered = true;
            sounds.newRecord();
            this.screenShake = 6;
            this.burstParticles(this.plane.x, this.plane.y, '#ffd700', 30);
            this.addPopup(this.plane.x + 30, this.plane.y - 30, '🏆 NEW RECORD!', '#ffd700');
          }

          // Length Stretch every 10 points
          if (this.score % 10 === 0) {
            this.plane.setScoreTier(this.score);
            sounds.stretch();
            const tier = Math.floor(this.score / 10);
            this.banner = {
              text: `⚡ SUPERSONIC STRETCH! LENGTH +${tier * 12}%`,
              timer: 2.2
            };
          }
        }

        // 2. Collectable Item Pickup
        if (b.item && b.item.active) {
          const ix = b.x + b.width / 2;
          const iy = b.gapCenter;
          const dx = ix - this.plane.x;
          const dy = iy - this.plane.y;
          if (Math.sqrt(dx * dx + dy * dy) < 28) {
            b.item.active = false;
            if (b.item.type === 'STAR') {
              this.score += 3;
              sounds.star();
              this.addPopup(ix, iy - 20, '+3 STAR!', '#ffd700');
              this.burstParticles(ix, iy, '#ffd700', 16);
            } else if (b.item.type === 'SHIELD') {
              this.plane.hasShield = true;
              sounds.shieldPickup();
              this.addPopup(ix, iy - 20, '🛡️ SHIELD READY!', '#00f2fe');
              this.burstParticles(ix, iy, '#00f2fe', 20);
            }
          }
        }

        // 3. "Close Call" / Near-Miss Bonus Detection
        if (!b.closeCallAwarded && bounds.right > b.x && bounds.left < b.x + b.width) {
          const topMargin = bounds.top - b.topHeight;
          const botMargin = b.bottomY - bounds.bottom;
          if ((topMargin > 0 && topMargin < 13) || (botMargin > 0 && botMargin < 13)) {
            b.closeCallAwarded = true;
            this.score += 2;
            sounds.closeCall();
            this.screenShake = 4;
            const sparkY = topMargin < 13 ? b.topHeight : b.bottomY;
            this.addPopup(this.plane.x + 20, this.plane.y - 25, 'CLOSE CALL! +2', '#ff9f43');
            this.burstParticles(this.plane.x, sparkY, '#ff9f43', 12);
          }
        }

        // 4. Building Collision (with Shield Protection)
        if (b.collidesWith(bounds)) {
          if (this.plane.invulnerableTimer > 0) {
            // Invulnerable from shield break
          } else if (this.plane.hasShield) {
            this.plane.hasShield = false;
            this.plane.invulnerableTimer = 1.0;
            this.plane.vy = -180;
            sounds.shieldBreak();
            this.screenShake = 9;
            this.burstParticles(this.plane.x, this.plane.y, '#00f2fe', 26);
            this.addPopup(this.plane.x + 20, this.plane.y - 30, 'SHIELD SAVED YOU! 🛡️', '#00f2fe');
          } else {
            this.triggerGameOver();
            return;
          }
        }

        // Cleanup offscreen buildings
        if (b.x + b.width < -40) {
          this.buildings.splice(i, 1);
        }
      }

      // Ground and ceiling collision
      if (bounds.bottom >= GROUND_Y || bounds.top <= 0) {
        if (this.plane.hasShield && this.plane.invulnerableTimer <= 0) {
          this.plane.hasShield = false;
          this.plane.invulnerableTimer = 1.0;
          this.plane.vy = -220;
          sounds.shieldBreak();
          this.screenShake = 9;
          this.burstParticles(this.plane.x, this.plane.y, '#00f2fe', 25);
          this.addPopup(this.plane.x + 20, this.plane.y - 30, 'SHIELD SAVED YOU! 🛡️', '#00f2fe');
        } else if (this.plane.invulnerableTimer <= 0) {
          this.triggerGameOver();
          return;
        }
      }
    }
  }

  draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    if (this.screenShake > 0) {
      const ox = (Math.random() - 0.5) * this.screenShake;
      const oy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(ox, oy);
    }

    // 1. Dynamic Environment (Sky, Sun/Moon, Clouds, Ground)
    const nightMode = this.score >= 30;
    this.env.draw(ctx, this.score);

    // 2. Visible Wind Streaks
    this.drawWindStreaks();

    // 3. Obstacles
    this.buildings.forEach(b => b.draw(ctx, nightMode));

    // 4. Plane
    this.plane.draw(ctx);

    // 5. Popups & Particles
    this.drawPopupsAndParticles();

    // 6. Length Notification Banner
    if (this.banner.timer > 0) {
      this.drawStretchBanner();
    }

    // 7. HUD / UI Overlays
    if (this.state === 'START') {
      this.drawStartScreen();
    } else if (this.state === 'PLAYING') {
      this.drawScoreHUD();
    } else if (this.state === 'GAMEOVER') {
      this.drawGameOverScreen();
    }

    ctx.restore();
  }

  drawWindStreaks() {
    ctx.save();
    this.windParticles.forEach(wp => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${wp.alpha})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(wp.x, wp.y);
      ctx.lineTo(wp.x + wp.len, wp.y - (this.windForce * 0.05));
      ctx.stroke();
    });
    ctx.restore();
  }

  drawPopupsAndParticles() {
    this.particles.forEach(pt => {
      ctx.save();
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    this.popups.forEach(pop => {
      ctx.save();
      ctx.font = '900 16px -apple-system, sans-serif';
      ctx.fillStyle = pop.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.globalAlpha = Math.max(0, pop.life / pop.maxLife);
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    });
  }

  drawScoreHUD() {
    ctx.save();
    ctx.textAlign = 'center';

    // Current Score
    ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 10;
    ctx.fillText(this.score, W / 2, 75);
    ctx.shadowBlur = 0;

    // Plane Length indicator badge
    const tier = Math.floor(this.score / 10);
    const pct = tier * 12;
    ctx.fillStyle = 'rgba(14, 28, 48, 0.7)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 120, 88, 115, 22, 11);
    ctx.fill();

    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.fillStyle = pct > 0 ? '#ffd700' : '#80d4ff';
    ctx.fillText(`PLANE: +${pct}%`, W / 2 - 62, 103);

    // Wind status indicator badge
    const windKts = Math.round(Math.abs(this.windForce) / 8);
    const windDir = this.windForce < -8 ? '↑ BREEZE' : this.windForce > 8 ? '↓ DRAFT' : 'CALM';
    ctx.fillStyle = 'rgba(14, 28, 48, 0.7)';
    ctx.beginPath();
    ctx.roundRect(W / 2 + 5, 88, 115, 22, 11);
    ctx.fill();

    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.fillStyle = Math.abs(this.windForce) > 24 ? '#ffbe76' : '#c7ecee';
    ctx.fillText(`💨 ${windDir} ${windKts}kt`, W / 2 + 62, 103);

    // Shield status badge
    if (this.plane.hasShield) {
      ctx.fillStyle = 'rgba(0, 242, 254, 0.25)';
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W / 2 - 45, 114, 90, 20, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('🛡️ SHIELDED', W / 2, 128);
    }

    ctx.restore();
  }

  drawStretchBanner() {
    ctx.save();
    ctx.textAlign = 'center';
    const alpha = Math.min(1.0, this.banner.timer / 0.4);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(10, 24, 45, 0.88)';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 180, 140, 360, 38, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 14px -apple-system, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 0;
    ctx.fillText(this.banner.text, W / 2, 164);

    ctx.restore();
  }

  drawStartScreen() {
    ctx.save();
    ctx.textAlign = 'center';

    // Game Title
    ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 100, 200, 0.6)';
    ctx.shadowBlur = 14;
    ctx.fillText('FLAPPY PLANE', W / 2, H * 0.16);
    ctx.shadowBlur = 0;

    // Detailed Mission Instructions Card
    const cardW = Math.min(420, W * 0.92);
    const cardH = 205;
    const cardX = W / 2 - cardW / 2;
    const cardY = H * 0.44;

    ctx.fillStyle = 'rgba(12, 24, 44, 0.9)';
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 14);
    ctx.fill();
    ctx.stroke();

    const pilot = LeaderboardSystem.getPilotName() || 'PILOT';
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`PILOT CALLSIGN: ${pilot}`, W / 2, cardY + 24);

    ctx.font = '900 18px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TAP OR PRESS SPACE TO FLY', W / 2, cardY + 50);

    // Feature Briefing Rows
    ctx.textAlign = 'left';
    const leftX = cardX + 20;
    ctx.font = '12px -apple-system, sans-serif';

    // 1. Close Calls
    ctx.fillStyle = '#ff9f43';
    ctx.fillText('⚡ CLOSE CALLS:', leftX, cardY + 78);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Skim building ledges for +2 Pts bonus', leftX + 115, cardY + 78);

    // 2. Shields & Stars
    ctx.fillStyle = '#00f2fe';
    ctx.fillText('🛡️ SHIELDS & ⭐:', leftX, cardY + 100);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Shield absorbs 1 crash! Stars = +3 Pts', leftX + 115, cardY + 100);

    // 3. Winds
    ctx.fillStyle = '#a8e6cf';
    ctx.fillText('💨 CROSSWINDS:', leftX, cardY + 122);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Gentle breeze thermals push your plane', leftX + 115, cardY + 122);

    // 4. Stretch
    ctx.fillStyle = '#ffd700';
    ctx.fillText('📏 STRETCH:', leftX, cardY + 144);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Plane grows +12% length every 10 Pts', leftX + 115, cardY + 144);

    ctx.textAlign = 'center';
    if (this.bestScore > 0) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px -apple-system, sans-serif';
      ctx.fillText(`👑 PERSONAL RECORD TO BEAT: ${this.bestScore}`, W / 2, cardY + 180);
    } else {
      ctx.fillStyle = '#7a9ec7';
      ctx.font = 'italic 11px -apple-system, sans-serif';
      ctx.fillText('Dodge skyscrapers & set your first record!', W / 2, cardY + 180);
    }

    ctx.restore();
  }

  drawGameOverScreen() {
    ctx.save();
    ctx.textAlign = 'center';

    ctx.fillStyle = 'rgba(10, 20, 36, 0.72)';
    ctx.fillRect(0, 0, W, H);

    const cardW = Math.min(320, W * 0.85);
    const cardH = 240;
    const cardX = W / 2 - cardW / 2;
    const cardY = H / 2 - cardH / 2 - 10;

    ctx.fillStyle = '#17253a';
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 14);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 10;
    ctx.fillText('FLIGHT OVER', W / 2, cardY + 44);
    ctx.shadowBlur = 0;

    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillStyle = '#8da2c0';
    ctx.fillText('SCORE', W / 2 - 65, cardY + 84);
    ctx.font = '900 36px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.score, W / 2 - 65, cardY + 122);

    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillStyle = '#8da2c0';
    ctx.fillText('BEST', W / 2 + 65, cardY + 84);
    ctx.font = '900 36px monospace';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(this.bestScore, W / 2 + 65, cardY + 122);

    const tier = Math.floor(this.score / 10);
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillStyle = '#00d2ff';
    ctx.fillText(`PLANE SIZE REACHED: +${tier * 12}%`, W / 2, cardY + 152);

    ctx.font = 'bold 15px -apple-system, sans-serif';
    ctx.fillStyle = this.restartCooldown <= 0 ? '#38bdf8' : '#64748b';
    ctx.fillText('TAP OR SPACE TO FLY AGAIN', W / 2, cardY + 190);

    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('🏆 Click Rankings at top to view Hall of Fame', W / 2, cardY + 218);

    ctx.restore();
  }
}

// ─────────────────────────────────────────────────────────────
// Dynamic Resize & Bootstrap
// ─────────────────────────────────────────────────────────────
const game = new Game();

function resizeCanvas() {
  const box = canvas.parentElement;
  if (!box) return;
  const rect = box.getBoundingClientRect();
  canvas.width = Math.max(320, Math.round(rect.width));
  canvas.height = Math.max(400, Math.round(rect.height));
  W = canvas.width;
  H = canvas.height;
  GROUND_Y = H - Math.min(80, Math.max(55, Math.round(H * 0.14)));
  game.plane.x = Math.max(90, Math.round(W * 0.22));
  game.env.initBackdrop();
  game.initWindParticles();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 200));
resizeCanvas();

let lastTime = performance.now();

function loop(currentTime) {
  const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
  lastTime = currentTime;

  game.update(dt);
  game.draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
