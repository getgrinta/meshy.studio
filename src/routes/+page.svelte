<script lang="ts">
  import { PUBLIC_APP_URL } from "$env/static/public";
</script>

<div class="container mx-auto flex flex-col gap-4 mt-8">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="card bg-base-100 shadow-sm">
      <figure>
        <img
          src="{PUBLIC_APP_URL}/api/mesh/Meshy?noise=8&sharpen=1&negate=false&gammaIn=2.1&gammaOut=2.2&brightness=100&saturation=100&hue=0&lightness=0&blur=0"
          alt="Meshy"
        />
      </figure>
      <div class="card-body">
        <h2 class="card-title">Mesh Gradient</h2>
        <p>Generate a stunning and crispy mesh gradient images with out API.</p>
        <div class="card-actions justify-end">
          <a href="/mesh" class="btn btn-primary">Generate</a>
        </div>
      </div>
    </div>
  </div>
</div>
