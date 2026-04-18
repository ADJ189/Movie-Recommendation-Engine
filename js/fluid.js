// js/fluid.js — GPU-like fluid simulation using WebGL / Canvas2D fallback
// Implements a simplified Navier-Stokes fluid with dye advection

class FluidSim {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.opts = {
      resolution: options.resolution || 128,
      viscosity: options.viscosity || 0.002,
      diffusion: options.diffusion || 0.00001,
      iterations: options.iterations || 16,
      colorMode: options.colorMode || "cinema", // "cinema" | "gold" | "purple"
      interactive: options.interactive !== false,
      autoSwirl: options.autoSwirl !== false,
    };
    this.N = this.opts.resolution;
    this.size = (this.N + 2) * (this.N + 2);
    this.mouseX = 0; this.mouseY = 0;
    this.prevMouseX = 0; this.prevMouseY = 0;
    this.isPointerDown = false;
    this.animId = null;
    this.t = 0;

    this._alloc();
    this._bindCanvas();
    if (this.opts.autoSwirl) this._startAutoSwirl();
    this._loop();
  }

  _alloc() {
    const s = this.size;
    // velocity fields
    this.u = new Float32Array(s); this.u0 = new Float32Array(s);
    this.v = new Float32Array(s); this.v0 = new Float32Array(s);
    // density / dye channels (RGB)
    this.dR = new Float32Array(s); this.dR0 = new Float32Array(s);
    this.dG = new Float32Array(s); this.dG0 = new Float32Array(s);
    this.dB = new Float32Array(s); this.dB0 = new Float32Array(s);
  }

  idx(x, y) { return x + (this.N + 2) * y; }

  addForce(x, y, amtU, amtV, dR, dG, dB) {
    const N = this.N;
    const ix = Math.floor(x * N) + 1;
    const iy = Math.floor(y * N) + 1;
    if (ix < 1 || ix > N || iy < 1 || iy > N) return;
    const i = this.idx(ix, iy);
    this.u0[i] += amtU;
    this.v0[i] += amtV;
    this.dR0[i] += dR;
    this.dG0[i] += dG;
    this.dB0[i] += dB;
  }

  _diffuse(b, x, x0, diff, dt) {
    const N = this.N;
    const a = dt * diff * N * N;
    const inv = 1.0 / (1 + 4 * a);
    for (let k = 0; k < this.opts.iterations; k++) {
      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          x[this.idx(i,j)] = (
            x0[this.idx(i,j)] +
            a * (x[this.idx(i-1,j)] + x[this.idx(i+1,j)] +
                 x[this.idx(i,j-1)] + x[this.idx(i,j+1)])
          ) * inv;
        }
      }
      this._setBnd(b, x);
    }
  }

  _advect(b, d, d0, u, v, dt) {
    const N = this.N;
    const dt0 = dt * N;
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        let x = i - dt0 * u[this.idx(i,j)];
        let y = j - dt0 * v[this.idx(i,j)];
        x = Math.max(0.5, Math.min(N + 0.5, x));
        y = Math.max(0.5, Math.min(N + 0.5, y));
        const i0 = Math.floor(x), i1 = i0 + 1;
        const j0 = Math.floor(y), j1 = j0 + 1;
        const s1 = x - i0, s0 = 1 - s1;
        const t1 = y - j0, t0 = 1 - t1;
        d[this.idx(i,j)] =
          s0*(t0*d0[this.idx(i0,j0)] + t1*d0[this.idx(i0,j1)]) +
          s1*(t0*d0[this.idx(i1,j0)] + t1*d0[this.idx(i1,j1)]);
      }
    }
    this._setBnd(b, d);
  }

  _project(u, v, p, div) {
    const N = this.N;
    const h = 1.0 / N;
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        div[this.idx(i,j)] = -0.5*h*(
          u[this.idx(i+1,j)] - u[this.idx(i-1,j)] +
          v[this.idx(i,j+1)] - v[this.idx(i,j-1)]
        );
        p[this.idx(i,j)] = 0;
      }
    }
    this._setBnd(0, div); this._setBnd(0, p);
    for (let k = 0; k < this.opts.iterations; k++) {
      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          p[this.idx(i,j)] = (div[this.idx(i,j)] +
            p[this.idx(i-1,j)] + p[this.idx(i+1,j)] +
            p[this.idx(i,j-1)] + p[this.idx(i,j+1)]) / 4;
        }
      }
      this._setBnd(0, p);
    }
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        u[this.idx(i,j)] -= 0.5*(p[this.idx(i+1,j)] - p[this.idx(i-1,j)])/h;
        v[this.idx(i,j)] -= 0.5*(p[this.idx(i,j+1)] - p[this.idx(i,j-1)])/h;
      }
    }
    this._setBnd(1, u); this._setBnd(2, v);
  }

  _setBnd(b, x) {
    const N = this.N;
    for (let i = 1; i <= N; i++) {
      x[this.idx(0,i)]   = b===1 ? -x[this.idx(1,i)]   : x[this.idx(1,i)];
      x[this.idx(N+1,i)] = b===1 ? -x[this.idx(N,i)]   : x[this.idx(N,i)];
      x[this.idx(i,0)]   = b===2 ? -x[this.idx(i,1)]   : x[this.idx(i,1)];
      x[this.idx(i,N+1)] = b===2 ? -x[this.idx(i,N)]   : x[this.idx(i,N)];
    }
    x[this.idx(0,0)]     = 0.5*(x[this.idx(1,0)]     + x[this.idx(0,1)]);
    x[this.idx(0,N+1)]   = 0.5*(x[this.idx(1,N+1)]   + x[this.idx(0,N)]);
    x[this.idx(N+1,0)]   = 0.5*(x[this.idx(N,0)]     + x[this.idx(N+1,1)]);
    x[this.idx(N+1,N+1)] = 0.5*(x[this.idx(N,N+1)]   + x[this.idx(N+1,N)]);
  }

  step(dt = 0.016) {
    const { viscosity: visc, diffusion: diff } = this.opts;

    // Velocity step
    this._diffuse(1, this.u0, this.u, visc, dt);
    this._diffuse(2, this.v0, this.v, visc, dt);
    this._project(this.u0, this.v0, this.u, this.v);
    this._advect(1, this.u, this.u0, this.u0, this.v0, dt);
    this._advect(2, this.v, this.v0, this.u0, this.v0, dt);
    this._project(this.u, this.v, this.u0, this.v0);

    // Density step (3 channels)
    this._diffuse(0, this.dR0, this.dR, diff, dt);
    this._advect(0, this.dR, this.dR0, this.u, this.v, dt);
    this._diffuse(0, this.dG0, this.dG, diff, dt);
    this._advect(0, this.dG, this.dG0, this.u, this.v, dt);
    this._diffuse(0, this.dB0, this.dB, diff, dt);
    this._advect(0, this.dB, this.dB0, this.u, this.v, dt);

    // Decay
    for (let i = 0; i < this.size; i++) {
      this.dR[i] *= 0.994; this.dG[i] *= 0.994; this.dB[i] *= 0.994;
      this.u[i] *= 0.99;   this.v[i] *= 0.99;
      this.u0[i] = 0; this.v0[i] = 0;
      this.dR0[i] = 0; this.dG0[i] = 0; this.dB0[i] = 0;
    }
  }

  render() {
    const N = this.N;
    const W = this.canvas.width, H = this.canvas.height;
    const ctx = this.canvas.getContext("2d");
    const img = ctx.getImageData(0, 0, W, H);
    const px = img.data;
    const scaleX = N / W, scaleY = N / H;

    for (let py2 = 0; py2 < H; py2++) {
      for (let px2 = 0; px2 < W; px2++) {
        const ix = Math.floor(px2 * scaleX) + 1;
        const iy = Math.floor(py2 * scaleY) + 1;
        const fi = this.idx(ix, iy);
        let r = this.dR[fi], g = this.dG[fi], b2 = this.dB[fi];
        r = Math.min(255, r * 255);
        g = Math.min(255, g * 255);
        b2 = Math.min(255, b2 * 255);
        const pi = (py2 * W + px2) * 4;
        px[pi]   = r;
        px[pi+1] = g;
        px[pi+2] = b2;
        px[pi+3] = Math.min(255, (r + g + b2) * 1.2 + 4);
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  _startAutoSwirl() {
    // Periodically inject dye swirls at random positions
    this._swirlInterval = setInterval(() => {
      if (this.isPointerDown) return;
      this.t += 0.03;
      const x = 0.5 + 0.35 * Math.cos(this.t);
      const y = 0.5 + 0.35 * Math.sin(this.t * 1.3);
      const speed = 180;
      const dx = -Math.sin(this.t) * speed;
      const dy = Math.cos(this.t * 1.3) * speed * 1.3;
      const [r, g, b] = this._colorForMode();
      this.addForce(x, y, dx, dy, r, g, b);

      // Occasional secondary splat
      if (Math.random() < 0.15) {
        const x2 = Math.random(), y2 = Math.random();
        const [r2, g2, b2] = this._colorForMode(true);
        this.addForce(x2, y2,
          (Math.random()-0.5)*120, (Math.random()-0.5)*120,
          r2, g2, b2);
      }
    }, 40);
  }

  _colorForMode(accent = false) {
    const t = this.t;
    switch (this.opts.colorMode) {
      case "gold":
        return accent
          ? [0.6, 0.1 + 0.1*Math.sin(t*2), 0.6]   // purple-ish
          : [0.9, 0.7 + 0.2*Math.sin(t), 0.1];     // gold
      case "purple":
        return accent
          ? [0.1, 0.5 + 0.2*Math.sin(t), 0.9]      // blue
          : [0.6, 0.1, 0.9 + 0.1*Math.sin(t*3)];   // purple
      default: // cinema
        return accent
          ? [0.5, 0.1*Math.sin(t), 0.9]
          : [0.9, 0.6 + 0.3*Math.sin(t*0.7), 0.05];
    }
  }

  _bindCanvas() {
    if (!this.opts.interactive) return;
    const onMove = (ex, ey) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (ex - rect.left) / rect.width;
      const y = (ey - rect.top) / rect.height;
      const dx = (x - this.prevMouseX) * 600;
      const dy = (y - this.prevMouseY) * 600;
      this.prevMouseX = x; this.prevMouseY = y;

      // Always respond to mouse movement (not just when down)
      const [r, g, b] = this._colorForMode(false);
      const strength = this.isPointerDown ? 1.0 : 0.3;
      this.addForce(x, y, dx * strength, dy * strength, r * strength, g * strength, b * strength);
    };

    this.canvas.addEventListener("mousemove", e => onMove(e.clientX, e.clientY));
    this.canvas.addEventListener("touchmove", e => {
      e.preventDefault();
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    this.canvas.addEventListener("mousedown", () => { this.isPointerDown = true; });
    this.canvas.addEventListener("mouseup",   () => { this.isPointerDown = false; });
    this.canvas.addEventListener("touchstart",() => { this.isPointerDown = true; });
    this.canvas.addEventListener("touchend",  () => { this.isPointerDown = false; });
  }

  _loop() {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      this.step(dt);
      this.render();
      this.animId = requestAnimationFrame(tick);
    };
    this.animId = requestAnimationFrame(tick);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this._swirlInterval) clearInterval(this._swirlInterval);
  }

  setColorMode(mode) {
    this.opts.colorMode = mode;
  }
}
