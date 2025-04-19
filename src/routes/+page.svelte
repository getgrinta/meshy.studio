<script lang="ts">
  import { PUBLIC_APP_URL } from "$env/static/public";
</script>

<div class="container mx-auto flex flex-col gap-4 mt-8">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="card bg-base-100 shadow-sm">
      <a href="/mesh" class="h-full">
        <figure>
          <img
            src="{PUBLIC_APP_URL}/api/mesh/Meshy?noise=8&sharpen=1&negate=false&gammaIn=2.1&gammaOut=2.2&brightness=100&saturation=100&hue=0&lightness=0&blur=0"
            alt="Meshy"
          />
        </figure>
      </a>
      <div class="card-body">
        <h2 class="card-title">Mesh Gradient</h2>
        <p>Generate a stunning and crispy mesh gradient images.</p>
        <div class="card-actions justify-end">
          <a href="/mesh" class="btn btn-primary">Generate</a>
        </div>
      </div>
    </div>
    <div class="card bg-base-100 shadow-sm">
      <a href="/chart" class="h-full">
        <figure class="h-full">
          <img
            src="{PUBLIC_APP_URL}/api/chart?data%5B0%5D%5Bx%5D=1996&data%5B0%5D%5By%5D=36&data%5B0%5D%5Bkey%5D=b7lFeo7y&data%5B1%5D%5Bx%5D=1997&data%5B1%5D%5By%5D=23&data%5B1%5D%5Bkey%5D=sll4BFtP&data%5B2%5D%5Bx%5D=1998&data%5B2%5D%5By%5D=38&data%5B2%5D%5Bkey%5D=joRyFtqy&darkMode=false&primaryColor=blue&borderRadius=8&barMargin=0.05"
            alt="Chart"
            class="object-cover h-full"
          />
        </figure>
      </a>
      <div class="card-body">
        <h2 class="card-title">Chart</h2>
        <p>Create flawless charts.</p>
        <div class="card-actions justify-end">
          <a href="/chart" class="btn btn-primary">Create</a>
        </div>
      </div>
    </div>
  </div>
</div>
