<script lang="ts">
  import SliderInput from "$lib/components/slider-input.svelte";
  import StudioLayout from "$lib/components/studio-layout.svelte";
  import {
    CopyIcon,
    DownloadIcon,
    GripHorizontalIcon,
    PlusIcon,
    XIcon,
  } from "lucide-svelte";
  import { createForm } from "felte";
  import qs from "qs";
  import { PRIMARY_COLOR } from "$lib/const";
  import { PUBLIC_APP_URL } from "$env/static/public";
  import { toast } from "svelte-sonner";
  import { pushState } from "$app/navigation";
  import { onMount } from "svelte";
  import { convert } from "colorizr";
  import colors from "tailwindcss/colors";
  import { ChartDataSchema } from "$lib/schema";
  import { draggable, droppable, type DragDropState } from "@thisux/sveltednd";
  import { Debounced } from "runed";
  import type { PageProps } from "./$types";

  const {
    form,
    data: formData,
    setData,
    addField,
    unsetField,
    swapFields,
  } = createForm({
    initialValues: {
      data: [{ x: "", y: 1 }],
      darkMode: false,
      primaryColor: "blue",
      borderRadius: 8,
      barMargin: 0.05,
      caption: "",
    },
  });

  let { data }: PageProps = $props();
  let mounted = $state(false);
  const searchString = $derived(qs.stringify($formData));
  const imgUrl = $derived(`/api/chart?${searchString}`);
  const debouncedImgUrl = new Debounced(() => imgUrl, 500);
  const fullUrl = $derived(`${PUBLIC_APP_URL}${imgUrl}`);

  function getLastLabelInput() {
    const lastLabelId = $formData.data.length - 1;
    return document.getElementById(`label.${lastLabelId}`);
  }

  function addBlankEntry() {
    addField("data", { x: "", y: 1 });
    setTimeout(() => {
      getLastLabelInput()?.focus();
    }, 10);
  }

  function removeEntry(index: number) {
    unsetField(`data.${index}`);
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(fullUrl);
    return toast.success("Copied to clipboard");
  }

  function handleDrop(state: DragDropState<{ key: string }>) {
    const { draggedItem, targetContainer } = state;
    const dragIndex = $formData.data.findIndex(
      (item: { key: string }) => item.key === draggedItem.key
    );
    const dropIndex = parseInt(targetContainer ?? "0");
    swapFields("data", dragIndex, dropIndex);
  }

  function handleDragStart(event: DragEvent) {
    const dragElements = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const valid = dragElements.some(
      (el: Element) => el.getAttribute("data-anchor") === "true"
    );
    if (valid) return;
    return event.preventDefault();
  }

  onMount(() => {
    const currentQuery = location.search.substring(1);
    const parsedQuery = ChartDataSchema.parse(qs.parse(currentQuery));
    setData("data", parsedQuery.data);
    setData("darkMode", parsedQuery.darkMode);
    setData("primaryColor", parsedQuery.primaryColor);
    setData("borderRadius", parsedQuery.borderRadius);
    setData("barMargin", parsedQuery.barMargin);
    setData("caption", parsedQuery.caption);
    setTimeout(() => {
      mounted = true;
    }, 100);
  });

  $effect(() => {
    if (!mounted) return;
    const currentQuery = location.search.substring(1);
    const nextSerializedQuery = qs.stringify($formData);
    if (currentQuery === nextSerializedQuery) return;
    pushState(`/chart?${nextSerializedQuery}`, {});
  });
</script>

<svelte:head>
  <title>Meshy - Chart</title>
  <meta property="og:title" content="Meshy - Chart" />
  <meta property="og:image" content={data.ogUrl} />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="800" />
  <meta property="og:image:height" content="600" />
  <meta property="og:description" content="Meshy chart" />
</svelte:head>

<form use:form class="flex flex-col flex-1">
  <StudioLayout>
    <div
      class="flex flex-1 h-full w-full flex-col gap-4 relative items-center justify-center"
    >
      {#if typeof window !== "undefined"}
        <figure class="max-w-[800px] w-full rounded-lg shadow-xl">
          <img src={debouncedImgUrl.current} alt="Chart" class="rounded-lg" />
        </figure>
      {/if}
      <div class="overflow-x-auto max-w-[800px] w-full">
        <table class="table">
          <thead>
            <tr>
              <th></th>
              <th>Label</th>
              <th>Value</th>
              <th
                ><button
                  class="btn btn-ghost btn-square"
                  onclick={addBlankEntry}
                >
                  <PlusIcon size={16} />
                </button></th
              >
            </tr>
          </thead>
          <tbody>
            {#each $formData.data as item, index}
              <tr
                class="border border-transparent"
                use:droppable={{
                  container: index.toString(),
                  callbacks: { onDrop: handleDrop },
                  attributes: {
                    dragOverClass: "border-yellow-500",
                  },
                }}
                use:draggable={{
                  container: index.toString(),
                  dragData: item,
                }}
                ondragstart={handleDragStart}
              >
                <th>
                  <button class="btn btn-ghost btn-square" data-anchor="true"
                    ><GripHorizontalIcon size={16} /></button
                  >
                </th>
                <td
                  ><input
                    id={`label.${index}`}
                    class="input"
                    bind:value={item.x}
                    name={`data.${index}.x`}
                  /></td
                >
                <td
                  ><input
                    id={`value.${index}`}
                    type="number"
                    class="input"
                    bind:value={item.y}
                    name={`data.${index}.y`}
                  /></td
                >
                <td>
                  <button
                    class="btn btn-ghost btn-square"
                    onclick={() => removeEntry(index)}
                    ><XIcon size={16} /></button
                  >
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="absolute bottom-0 right-0">
        Built by
        <a
          href="https://getgrinta.com"
          target="_blank"
          rel="noopener noreferrer">getgrinta.com</a
        >
      </div>
    </div>
    {#snippet sidebar()}
      <h2 class="text-lg font-semibold">Chart</h2>
      <label class="label" for="type">Type</label>
      <select id="type" class="select w-full" disabled>
        <option value="bar">Bar</option>
        <option value="line">Line</option>
      </select>
      <label class="label" for="darkMode">Mode</label>
      <label class="label gap-4" for="darkMode">
        <input
          type="checkbox"
          class="toggle"
          id="darkMode"
          name="darkMode"
          checked={$formData.darkMode}
        />
        <span>Dark Mode</span>
      </label>
      <label class="label" for="caption">Caption</label>
      <input
        id="caption"
        name="caption"
        class="input w-full"
        type="text"
        value={$formData.caption}
        placeholder="Chart caption..."
        maxlength="100"
      />
      <label class="label gap-4" for="primaryColor">Primary Color</label>
      <div class="grid grid-cols-8 gap-2">
        {#each PRIMARY_COLOR as color}
          <input
            type="radio"
            name="primaryColor"
            value={color}
            class="btn btn-sm btn-ghost btn-square border-2 checked:border-primary"
            style="background-color: {convert(colors[color][500], 'hex')}"
            checked={$formData.primaryColor === color}
          />
        {/each}
      </div>
      <label class="label" for="borderRadius">Border Radius</label>
      <SliderInput
        id="borderRadius"
        min={0}
        max={32}
        value={$formData.borderRadius}
        step={1}
        name="borderRadius"
      />
      <label class="label" for="barMargin">Bar Margin</label>
      <SliderInput
        id="barMargin"
        min={0}
        max={0.75}
        value={$formData.barMargin}
        step={0.01}
        name="barMargin"
      />
      <div class="flex gap-2 mt-auto">
        <a href={fullUrl} download class="btn flex-1 btn-primary">
          <DownloadIcon size={16} />
          <span>Download</span>
        </a>
        <button class="btn flex-1" onclick={copyUrl}>
          <CopyIcon size={16} />
          <span>Copy Link</span>
        </button>
      </div>
    {/snippet}
  </StudioLayout>
</form>
