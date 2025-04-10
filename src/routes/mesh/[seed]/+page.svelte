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
  import { PaneGroup, Pane, PaneResizer } from "paneforge";
  import { draggable } from "@neodrag/svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import clsx from "clsx";
  import SliderInput from "$lib/components/slider-input.svelte";

  let seed = $derived(page.params.seed);
  let parsedSearch = $state<AvatarProps>();
  const stringSearch = $derived<string>(`?${qs.stringify(parsedSearch)}`);

  let parentEl = $state<HTMLElement>();
  let parentSize = new ElementSize(() => parentEl);
  let imgPosition = $state({ x: 0, y: 0 });
  let imgDragged = $state(false);
  let imgLoading = $state(true);
  let zoom = $state<number>(1);
  let tab = $state<"gradient" | "filters">("gradient");
  let imgSrc = $state<string>();
  const imgSrcDebounced = new Debounced(() => imgSrc, 400);
  const seedDebounced = new Debounced(() => seed, 400);
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
    console.log(event, zoom);
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

{#if parsedSearch}
  <div bind:this={parentEl} class="flex flex-1 flex-col">
    <PaneGroup
      direction={parentSize.width > 768 ? "horizontal" : "vertical"}
      autoSaveId="studio"
      class="flex-1"
    >
      <Pane
        minSize={25}
        defaultSize={75}
        class="relative block lg:flex items-center justify-center"
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
            "relative w-[512px] h-[512px] m-2 flex justify-center items-center shadow-xl cursor-grab",
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
              class="input input-sm w-20 join-item"
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
        defaultSize={25}
        class="p-2 block lg:flex flex-col gap-4 !overflow-scroll"
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
        <div
          class="collapse collapse-arrow bg-base-100 border-2 border-base-300"
        >
          <input type="checkbox" checked />
          <div class="collapse-title font-semibold">Gradient</div>
          <div class="collapse-content flex flex-col gap-2">
            <label class="label text-sm" for="seed">Seed</label>
            <div class="join">
              <input
                id="seed"
                type="text"
                class="input w-full join-item"
                placeholder="Seed"
                bind:value={seed}
              />
              <button class="btn join-item" onclick={randomSeed}>
                <RefreshCcwIcon size={16} />
                Random
              </button>
            </div>
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
        </div>
        <div
          class="collapse collapse-arrow bg-base-100 border-2 border-base-300"
        >
          <input type="checkbox" checked />
          <div class="collapse-title font-semibold">Filters</div>
          <div class="collapse-content flex flex-col gap-2">
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
