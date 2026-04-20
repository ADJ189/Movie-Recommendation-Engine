<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { FluidSim } from '../lib/fluid';

  let { colorMode = 'cinema' }: { colorMode?: 'cinema' | 'gold' | 'aurora' } = $props();

  let canvas: HTMLCanvasElement;
  let sim: FluidSim | null = null;
  let mouseX = 0, mouseY = 0;

  $effect(() => {
    if (sim) sim.colorMode = colorMode;
  });

  function onPointerMove(e: PointerEvent) {
    if (!sim || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1 / rect.width;
    const scaleY = 1 / rect.height;
    const nx = (e.clientX - rect.left) * scaleX;
    const ny = (e.clientY - rect.top)  * scaleY;
    const dx = (nx - mouseX) * 380;
    const dy = (ny - mouseY) * 380;
    mouseX = nx; mouseY = ny;
    const held = e.buttons > 0;
    const str  = held ? 1.0 : 0.28;
    const [cr, cg, cb] = colorMode === 'gold'
      ? [0.9, 0.65, 0.05]
      : colorMode === 'aurora'
      ? [0.1, 0.9, 0.7]
      : [0.85, 0.55, 0.05];
    sim.splat(nx, ny, dx*str, dy*str, cr*str, cg*str, cb*str);
  }

  onMount(() => {
    sim = new FluidSim(canvas, { N: 72, viscosity: 0.00025, diffusion: 0.000004, iterations: 10 });
  });

  onDestroy(() => sim?.destroy());
</script>

<canvas
  bind:this={canvas}
  class="fluid-canvas"
  onpointermove={onPointerMove}
  aria-hidden="true"
></canvas>

<style>
  .fluid-canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    image-rendering: pixelated;
    object-fit: cover;
    opacity: 0.5;
    mix-blend-mode: screen;
    pointer-events: all;
    z-index: 0;
    transform: scale(1.01); /* hide 1px edges */
    will-change: contents;
  }
</style>
