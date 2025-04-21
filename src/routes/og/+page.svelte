<script lang="ts">
  import StudioLayout from "$lib/components/studio-layout.svelte";
  import { createForm } from "felte";
  import type { PageProps } from "./$types";
  import { OgDataSchema, type OgData } from "$lib/schema";
  import { page } from "$app/state";
  import qs from "qs";
  import { OG_TEMPLATE } from "$lib/const";
  import { createHighlighter } from "shiki";
  import { buildSyntax } from "$lib/og";
  import { CopyIcon, DownloadIcon } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import clsx from "clsx";
  import { pushState } from "$app/navigation";
  import { onMount } from "svelte";

  const FULL_URL = "https://meshy.studio/api/og";

  let { data }: PageProps = $props();

  let mounted = $state(false);
  const escapedSearch = $derived(
    page.url.search ? page.url.search.substring(1) : ""
  );

  const { form, data: formData } = createForm({
    initialValues: OgDataSchema.parse(qs.parse(escapedSearch)),
  });

  let ogFlavor = $state<"sveltekit" | "nextjs" | "tanstack">("sveltekit");
  let ogSyntax = $state("");
  const imgUrl = $derived(`/api/og?${qs.stringify($formData)}`);

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async function highlightSyntax(syntax: string) {
    const highlighter = await createHighlighter({
      themes: ["ayu-dark"],
      langs: ["tsx", "svelte"],
    });
    return highlighter.codeToHtml(syntax, {
      lang: ogFlavor === "sveltekit" ? "svelte" : "tsx",
      theme: "ayu-dark",
    });
  }

  async function copyUrl() {
    navigator.clipboard.writeText(imgUrl);
    return toast.success("Copied to clipboard");
  }

  async function copySyntax() {
    navigator.clipboard.writeText(ogSyntax);
    return toast.success("Copied to clipboard");
  }

  function setFlavor(flavor: "sveltekit" | "nextjs" | "tanstack") {
    ogFlavor = flavor;
  }

  $effect(() => {
    highlightSyntax(
      buildSyntax({
        flavor: ogFlavor,
        formData: $formData,
        baseUrl: FULL_URL,
      })
    ).then((syntax) => {
      ogSyntax = syntax;
    });
  });

  $effect(() => {
    if (!mounted) return;
    const currentQuery = location.search.substring(1);
    const nextSerializedQuery = qs.stringify($formData);
    if (currentQuery === nextSerializedQuery) return;
    pushState(`/og?${nextSerializedQuery}`, {});
  });

  onMount(() => {
    setTimeout(() => {
      mounted = true;
    }, 100);
  });
</script>

<svelte:head>
  <title>Meshy - OG Image</title>
  <meta property="og:title" content="Meshy - OG Image" />
  <meta property="og:image" content={data.ogUrl} />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:description" content="Meshy OG Image" />
</svelte:head>

<form use:form class="flex flex-col flex-1">
  <StudioLayout>
    <div class="flex flex-col gap-8">
      <figure class="max-w-[800px] w-full rounded-lg shadow-xl">
        <img src={imgUrl} alt="OG Image" class="rounded-lg" />
      </figure>
      <div
        class="relative max-w-[800px] w-full textarea overflow-scroll bg-[#0b0e14]"
      >
        <div role="tablist" class="tabs tabs-border w-full">
          <button role="tab" class="btn btn-square" onclick={copySyntax}>
            <CopyIcon size={16} />
          </button>
          <button
            role="tab"
            class={clsx("tab", { "tab-active": ogFlavor === "sveltekit" })}
            onclick={() => setFlavor("sveltekit")}>SvelteKit</button
          >
          <button
            role="tab"
            class={clsx("tab", { "tab-active": ogFlavor === "tanstack" })}
            onclick={() => setFlavor("tanstack")}>TanStack</button
          >
          <button
            role="tab"
            class={clsx("tab", { "tab-active": ogFlavor === "nextjs" })}
            onclick={() => setFlavor("nextjs")}>Next.js</button
          >
        </div>
        <div class="p-4">
          {@html ogSyntax}
        </div>
      </div>
    </div>
    {#snippet sidebar()}
      <h2 class="text-lg font-semibold">Settings</h2>
      <label class="label" for="template">Template</label>
      <select id="template" name="template" class="select w-full">
        {#each OG_TEMPLATE as template}
          <option value={template}>{capitalize(template)}</option>
        {/each}
      </select>
      <label class="label" for="darkMode">Dark Mode</label>
      <label class="label gap-4" for="darkMode">
        <input type="checkbox" id="darkMode" name="darkMode" class="toggle" />
        <span>Dark Mode</span>
      </label>
      <label class="label" for="branding">Branding</label>
      <input id="branding" name="branding" class="input w-full" type="text" />
      <label class="label" for="title">Title</label>
      <input id="title" name="title" class="input w-full" type="text" />
      <label class="label" for="description">Description</label>
      <textarea
        id="description"
        name="description"
        class="textarea w-full resize-none"
      ></textarea>
      <div class="flex gap-2 mt-auto">
        <a href={imgUrl} download class="btn flex-1 btn-primary">
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
