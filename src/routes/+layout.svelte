<script lang="ts">
  import "../app.css";
  import { Toaster } from "svelte-sonner";
  import { GithubIcon } from "lucide-svelte";
  let { children } = $props();
</script>

<Toaster theme="dark" position="bottom-left" />

<div class="flex flex-col min-h-screen">
  <div
    class="navbar bg-base-100 border-b-2 border-base-300 z-10 justify-between"
  >
    <a class="btn btn-ghost" href="/">
      <img src="/logo.png" alt="Logo" class="w-8 h-8" />
      <span class="text-lg">Meshy</span>
    </a>
    <div class="flex items-center gap-2">
      <a
        class="btn"
        href="https://getgrinta.com"
        target="_blank"
        rel="noopener noreferrer">Check out Grinta</a
      >
      <a
        class="btn btn-square"
        href="https://github.com/getgrinta/meshy.studio"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GithubIcon size={16} />
      </a>
    </div>
  </div>
  <div class="flex-1 flex flex-col">
    {@render children()}
  </div>
</div>
