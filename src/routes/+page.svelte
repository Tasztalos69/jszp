<script lang="ts">
  import { goto, beforeNavigate, afterNavigate } from "$app/navigation";
  import PlateInput from "$lib/components/PlateInput.svelte";

  type ServerStatus = "initializing" | "alive" | "broken";

  let plate = $state("");
  let error = $state("");
  let loading = $state(false);
  let serverStatus = $state<ServerStatus>("initializing");

  // Use navigate hooks — more reliable than the navigating rune
  beforeNavigate(() => { loading = true; });
  afterNavigate(() => { loading = false; });

  async function pollStatus() {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      serverStatus = data.status;
    } catch {
      serverStatus = "broken";
    }
  }

  $effect(() => {
    pollStatus();
    const interval = setInterval(pollStatus, 5_000);
    return () => clearInterval(interval);
  });

  function handleInput(e: Event) {
    plate = (e.target as HTMLInputElement).value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const val = plate.trim();
    if (!val) { error = "Adjon meg egy rendszámot."; return; }
    if (!/^[A-Z0-9]{6,7}$/.test(val)) { error = "Érvénytelen rendszám (6–7 karakter, betűk és számok)."; return; }
    error = "";
    goto(`/car/${val}`);
  }

  const statusMeta: Record<ServerStatus, { label: string; color: string }> = {
    initializing: { label: "Csatlakozás…", color: "bg-amber-500" },
    alive:        { label: "Kapcsolat aktív", color: "bg-green-600" },
    broken:       { label: "Kapcsolat sikertelen", color: "bg-red-600" },
  };
</script>

<svelte:head>
  <title>JSZP Lekérdező</title>
</svelte:head>

{#if loading}
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-50/90 backdrop-blur-sm">
    <div class="size-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin"></div>
    <div class="text-center">
      <p class="font-semibold text-slate-800 text-lg">Lekérdezés folyamatban…</p>
      <p class="text-slate-500 text-sm mt-1">Ez 30–60 másodpercet vehet igénybe</p>
    </div>
  </div>
{/if}

<div class="min-h-dvh flex flex-col items-center justify-center bg-slate-50 px-4 pb-0 pt-6">
  <main class="w-full max-w-md bg-white border border-slate-200 rounded-2xl px-8 py-10 shadow-sm">
    <h1 class="text-3xl font-extrabold text-slate-900 text-center tracking-tight mb-1">JSZP</h1>
    <p class="text-sm text-slate-500 text-center mb-8">Járműadatok lekérdezése</p>

    <form onsubmit={handleSubmit} novalidate class="flex flex-col gap-3">
      <PlateInput value={plate} oninput={handleInput} />

      {#if error}
        <p id="plate-error" class="text-red-600 text-sm -mt-1" role="alert">{error}</p>
      {/if}

      <button
        type="submit"
        class="flex items-center justify-center gap-2 w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-base rounded-lg transition-colors cursor-pointer"
      >
        Lekérdezés
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </form>
  </main>

  <footer class="mt-auto py-5 flex items-center gap-2 text-sm text-slate-500">
    <span class="size-2 rounded-full shrink-0 transition-colors {statusMeta[serverStatus].color}" aria-hidden="true"></span>
    <span>{statusMeta[serverStatus].label}</span>
  </footer>
</div>
