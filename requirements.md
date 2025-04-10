# Meshy2 Application Requirements

## Functional Requirements

1.  **Generate Mesh Gradient Image:** The application must generate a mesh gradient image based on input parameters.
2.  **JPEG Output:** The generated image must be output in JPEG format.
3.  **API Endpoint:** The image generation must be accessible via an HTTP GET request to the `/gen` endpoint.
4.  **Seed Customization:** Users must be able to specify a seed value via a `seed` query parameter to ensure deterministic/reproducible gradient generation for the same inputs.
    *   If no seed is provided, a default seed must be used.
5.  **Noise Overlay:** Users must be able to optionally enable a noise overlay effect on the generated gradient via a `noise` query parameter.
    *   Specific values ("true") should enable the noise. Omission or other values should disable it.

## Non-Functional Requirements

1.  **Technology Stack:** The application must be built using the SvelteKit framework.
2.  **Image Processing Library:** The application must use the `sharp` library for converting the internally generated SVG to PNG.
3.  **Performance:** The image generation should be reasonably fast for a good user experience (specific time target TBD).
4.  **Caching:** Generated images should be cacheable by clients/proxies (using appropriate HTTP cache headers).
5.  **Gradient Algorithm:** The mesh gradient effect must be achieved by generating an SVG containing multiple colored circles and applying a heavy Gaussian blur filter. An "overflow" effect should be implemented by placing some circles outside the main viewbox.

## Mesh example:

```html
<svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background base gradient -->
    <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#cfcbe4"/>
      <stop offset="100%" stop-color="#d98ee0"/>
    </linearGradient>

    <!-- Radial gradients for mesh look -->
    <radialGradient id="grad1" cx="15%" cy="20%" r="40%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="grad2" cx="70%" cy="25%" r="40%">
      <stop offset="0%" stop-color="#fca15e"/>
      <stop offset="100%" stop-color="#fca15e" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="grad3" cx="45%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#5e5ce6"/>
      <stop offset="100%" stop-color="#5e5ce6" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="grad4" cx="60%" cy="10%" r="40%">
      <stop offset="0%" stop-color="#78c7ff"/>
      <stop offset="100%" stop-color="#78c7ff" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="grad5" cx="90%" cy="90%" r="50%">
      <stop offset="0%" stop-color="#d85cf0"/>
      <stop offset="100%" stop-color="#d85cf0" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="grad6" cx="5%" cy="95%" r="40%">
      <stop offset="0%" stop-color="#f7dea3"/>
      <stop offset="100%" stop-color="#f7dea3" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Base background -->
  <rect width="100%" height="100%" fill="url(#base)" />

  <!-- Layered radial gradients -->
  <rect width="100%" height="100%" fill="url(#grad1)" />
  <rect width="100%" height="100%" fill="url(#grad2)" />
  <rect width="100%" height="100%" fill="url(#grad3)" />
  <rect width="100%" height="100%" fill="url(#grad4)" />
  <rect width="100%" height="100%" fill="url(#grad5)" />
  <rect width="100%" height="100%" fill="url(#grad6)" />
</svg>
```