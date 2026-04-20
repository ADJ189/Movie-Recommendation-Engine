<script lang="ts">
  import { appState } from './stores/appState.svelte';
  import FluidCanvas from './components/FluidCanvas.svelte';
  import Landing from './components/Landing.svelte';
  import Quiz from './components/Quiz.svelte';
  import Rating from './components/Rating.svelte';
  import Results from './components/Results.svelte';

  // Map screen → fluid color mode
  const colorModes = {
    landing: 'cinema',
    quiz:    'gold',
    rating:  'aurora',
    results: 'cinema',
  } as const;

  let colorMode = $derived(colorModes[appState.screen]);
</script>

<!-- Global fluid dynamics background -->
<FluidCanvas {colorMode} />

<!-- Grain overlay -->
<div class="grain" aria-hidden="true"></div>

<!-- Screen router with CSS transitions -->
<div class="router" data-screen={appState.screen}>
  {#if appState.screen === 'landing'}
    <div class="page" key="landing">
      <Landing />
    </div>
  {:else if appState.screen === 'quiz'}
    <div class="page" key="quiz">
      <Quiz />
    </div>
  {:else if appState.screen === 'rating'}
    <div class="page" key="rating">
      <Rating />
    </div>
  {:else if appState.screen === 'results'}
    <div class="page" key="results">
      <Results />
    </div>
  {/if}
</div>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  :global(html) {
    scroll-behavior: smooth;
    color-scheme: dark;
  }

  :global(body) {
    background: #000;
    color: #f5f5f7;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    min-height: 100svh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(::-webkit-scrollbar) { width: 0; }

  :global(button) {
    font-family: inherit;
    cursor: pointer;
  }

  :global(img) {
    max-width: 100%;
    display: block;
  }

  /* Grain texture */
  .grain {
    position: fixed;
    inset: 0;
    z-index: 1000;
    pointer-events: none;
    opacity: 0.028;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 196px;
  }

  /* Page transitions */
  .router { position: relative; min-height: 100svh; }
  .page {
    min-height: 100svh;
    animation: pageIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes pageIn {
    from { opacity: 0; transform: translateY(18px) scale(0.99); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>
