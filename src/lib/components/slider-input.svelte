<script lang="ts">
  let {
    value = $bindable(),
    min = 0,
    max = 100,
    step = 1,
    id,
  } = $props<{
    value: number;
    min?: number;
    max?: number;
    step?: number;
    id?: string;
  }>();

  $effect(() => {
    if (step && value % step !== 0) value = Math.round(value / step) * step;
    if (min && value < min) value = min;
    if (max && value > max) value = max;
  });
</script>

<div class="flex items-center gap-2">
  <input
    type="number"
    class="input input-xs border-neutral bg-neutral shadow-none w-20"
    bind:value
    {id}
  />
  <input
    type="range"
    class="range range-sm flex-1 w-full"
    bind:value
    {min}
    {max}
    {step}
  />
</div>
