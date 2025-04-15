<script lang="ts">
  import { PUBLIC_APP_URL } from "$env/static/public";
  import { AvatarParams, getRandomSeed, type AvatarProps } from "$lib/schema";
  import qs from "qs";
  import { Debounced, watch, ElementSize } from "runed";
  import {
    CopyIcon,
    DownloadIcon,
    MinusIcon,
    PlusIcon,
    RefreshCcwIcon,
  } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { PaneGroup, Pane, PaneResizer, type PaneGroupAPI } from "paneforge";
  import { draggable } from "@neodrag/svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import clsx from "clsx";
  import SliderInput from "$lib/components/slider-input.svelte";

  let seed = $derived(page.params.seed);
  let parsedSearch = $state<AvatarProps>();
  const stringSearch = $derived<string>(`?${qs.stringify(parsedSearch)}`);

  let parentEl = $state<HTMLElement>();
  let paneGroup = $state<PaneGroupAPI>();
  let parentSize = new ElementSize(() => parentEl);
  let imgPosition = $state({ x: 0, y: 0 });
  let imgDragged = $state(false);
  let imgLoading = $state(true);
  let zoom = $state<number>(1);
  let tab = $state<"gradient" | "filters">("gradient");
  let imgSrc = $state<string>();
  const imgSrcDebounced = new Debounced(() => imgSrc, 500);
  const seedDebounced = new Debounced(() => seed, 500);
  const fullUrl = $derived<string>(`${PUBLIC_APP_URL}${imgSrc}`);

  function randomSeed() {
    seed = getRandomSeed();
  }

  function toPercent(value: number) {
    return `${(value * 100).toFixed(0)}%`;
  }

  function zoomIn() {
    zoom += 0.1;
    zoom = Math.min(Math.max(zoom, 0.5), 2);
  }

  function zoomOut() {
    zoom -= 0.1;
    zoom = Math.min(Math.max(zoom, 0.5), 2);
  }

  $effect(() => {
    const parsedString = qs.parse(page.url.search);
    parsedSearch = AvatarParams.parse(parsedString);
  });

  $effect(() => {
    if (!parsedSearch) return;
    imgSrc = `/api/mesh/${seed}${stringSearch}`;
    history.pushState({}, "", stringSearch);
  });

  $effect(() => {
    if (!paneGroup) return;
    if (parentSize.width > 768) return paneGroup.setLayout([75, 25]);
    paneGroup.setLayout([50, 50]);
  });

  watch(
    () => seedDebounced.current,
    () => {
      // only goto on seed change
      goto(`/mesh/${seedDebounced.current}${stringSearch}`);
    }
  );

  function copyImageUrl() {
    navigator.clipboard.writeText(fullUrl);
    return toast.success("Copied to clipboard");
  }

  function onWheel(event: WheelEvent) {
    if (!event.metaKey) return;
    const zoomSpeed = 0.02;
    let newZoom = zoom;
    if (event.deltaY < 0) {
      newZoom += zoomSpeed;
    } else {
      newZoom -= zoomSpeed;
    }
    zoom = Math.min(Math.max(newZoom, 0.5), 2);
  }

  function onImgDragStart() {
    imgDragged = false;
  }

  function onImgDrag({
    offsetX,
    offsetY,
  }: {
    offsetX: number;
    offsetY: number;
  }) {
    imgPosition = { x: offsetX, y: offsetY };
  }

  function resetImgPosition() {
    imgPosition = { x: 0, y: 0 };
    imgDragged = true;
  }

  function onImgLoad() {
    imgLoading = false;
  }
</script>

<svelte:head>
  <title>Meshy - {seed}</title>
  <meta property="og:image" content={fullUrl} />
</svelte:head>

{#if parsedSearch}
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
        onwheel={onWheel}
      >
        <figure
          use:draggable={{
            bounds: "parent",
            position: imgPosition,
            onDrag: onImgDrag,
            onDragEnd: resetImgPosition,
            onDragStart: onImgDragStart,
          }}
          class={clsx(
            "relative w-full h-full max-w-[512px] max-h-[512px] flex justify-center items-center shadow-xl cursor-grab",
            imgDragged && "transition",
            imgLoading && "skeleton"
          )}
          style={`scale: ${zoom}`}
        >
          <img
            src={imgSrcDebounced.current}
            alt="Blur"
            class="absolute inset-0 blur-[8rem] opacity-40"
          />
          <img
            src={imgSrcDebounced.current}
            alt="Meshy"
            draggable="false"
            class="rounded-lg z-10"
            onload={onImgLoad}
          />
        </figure>
        <div class="absolute bottom-4 right-4 flex items-center gap-2">
          <div class="text-sm mr-4">
            Built by <a
              href="https://getgrinta.com"
              target="_blank"
              rel="noopener noreferrer">getgrinta.com</a
            >
          </div>
          <div class="join">
            <button class="btn btn-sm btn-square join-item" onclick={zoomIn}>
              <PlusIcon size={16} />
            </button>
            <input
              value={toPercent(zoom)}
              class="input input-sm w-20 bg-neutral border-neutral shadow-none join-item"
              readonly
            />
            <button class="btn btn-sm btn-square join-item" onclick={zoomOut}>
              <MinusIcon size={16} />
            </button>
          </div>
        </div>
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
        <div class="tabs tabs-sm tabs-box w-full">
          <input
            type="radio"
            name="tabs"
            class="tab"
            aria-label="Gradient"
            bind:group={tab}
            value="gradient"
          />
          <input
            type="radio"
            name="tabs"
            class="tab"
            aria-label="Mint (soon™️)"
            bind:group={tab}
            value="filters"
            disabled
          />
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="font-semibold">Gradient</h2>
          <label class="label text-sm" for="seed">Seed</label>
          <div class="join">
            <input
              id="seed"
              type="text"
              class="input w-full bg-neutral border-neutral shadow-none join-item"
              placeholder="Seed"
              bind:value={seed}
            />
            <button class="btn join-item" onclick={randomSeed}>
              <RefreshCcwIcon size={16} />
              Random
            </button>
          </div>
          <label class="label text-sm" for="text">Text</label>
          <input
            id="text"
            type="text"
            class="input w-full bg-neutral border-neutral shadow-none join-item"
            placeholder="Text"
            bind:value={parsedSearch.text}
          />
          <label class="label text-sm" for="noise">Noise</label>
          <SliderInput
            id="noise"
            bind:value={parsedSearch.noise}
            min={0}
            max={32}
          />
          <label class="label text-sm" for="sharpen">Sharpen</label>
          <SliderInput
            id="sharpen"
            bind:value={parsedSearch.sharpen}
            min={1}
            max={10}
            step={0.1}
          />
          <label class="label text-sm" for="negate">Negate</label>
          <input
            id="negate"
            type="checkbox"
            bind:checked={parsedSearch.negate}
            class="toggle"
          />
          <label class="label text-sm" for="gammaIn">Gamma In</label>
          <SliderInput
            id="gammaIn"
            bind:value={parsedSearch.gammaIn}
            min={1}
            max={3}
            step={0.1}
          />
          <label class="label text-sm" for="gammaOut">Gamma Out</label>
          <SliderInput
            id="gammaOut"
            bind:value={parsedSearch.gammaOut}
            min={1}
            max={3}
            step={0.1}
          />
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="font-semibold">Filters</h2>
          <label class="label text-sm" for="blur">Blur</label>
          <SliderInput
            id="blur"
            bind:value={parsedSearch.blur}
            min={0}
            max={80}
            step={1}
          />
          <label class="label text-sm" for="brightness">Brightness</label>
          <SliderInput
            id="brightness"
            bind:value={parsedSearch.brightness}
            min={0}
            max={100}
            step={1}
          />
          <label class="label text-sm" for="saturation">Saturation</label>
          <SliderInput
            id="saturation"
            bind:value={parsedSearch.saturation}
            min={0}
            max={100}
            step={1}
          />
          <label class="label text-sm" for="hue">Hue</label>
          <SliderInput
            id="hue"
            bind:value={parsedSearch.hue}
            min={0}
            max={360}
            step={1}
          />
          <label class="label text-sm" for="lightness">Lightness</label>
          <SliderInput
            id="lightness"
            bind:value={parsedSearch.lightness}
            min={0}
            max={100}
            step={1}
          />
        </div>
        <div class="w-full flex gap-2 mt-auto">
          <a
            class="flex-1 btn btn-primary"
            href={fullUrl}
            download={`${seed}.jpg`}
          >
            <DownloadIcon size={16} />
            <span>Download</span>
          </a>
          <button class="flex-1 btn" onclick={copyImageUrl}>
            <CopyIcon size={16} />
            <span>Copy Link</span>
          </button>
        </div>
      </Pane>
    </PaneGroup>
  </div>
{/if}
