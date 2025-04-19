<script lang="ts">
  import { PaneGroup, Pane, PaneResizer, type PaneGroupAPI } from "paneforge";
  import { ElementSize } from "runed";
  import type { Snippet } from "svelte";

  const { children, sidebar } = $props<{
    children: Snippet;
    sidebar: Snippet;
  }>();

  let parentEl = $state<HTMLElement>();
  let paneGroup = $state<PaneGroupAPI>();
  let parentSize = new ElementSize(() => parentEl);

  $effect(() => {
    if (!paneGroup) return;
    if (parentSize.width > 768) return paneGroup.setLayout([75, 25]);
    paneGroup.setLayout([50, 50]);
  });
</script>

<div bind:this={parentEl} class="flex flex-1 flex-col">
  <PaneGroup
    bind:paneGroup
    direction={parentSize.width > 768 ? "horizontal" : "vertical"}
    autoSaveId="studio"
    class="flex flex-1"
  >
    <Pane
      minSize={25}
      defaultSize={parentSize.width > 768 ? 75 : 50}
      maxSize={80}
      class="relative block lg:flex items-center justify-center p-4"
    >
      {@render children()}
    </Pane>
    <PaneResizer class="w-1 flex items-center">
      <div class="w-[2px] bg-base-300 h-full"></div>
    </PaneResizer>
    <Pane
      minSize={20}
      maxSize={50}
      defaultSize={parentSize.width > 768 ? 25 : 50}
      class="p-4 block lg:flex flex-nowrap flex-col gap-4 !overflow-scroll max-h-[calc(100vh-4rem)]"
    >
      {@render sidebar?.()}
    </Pane>
  </PaneGroup>
</div>
