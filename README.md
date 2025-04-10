# Meshy

Meshy is a powerful API designed for generating stunning mesh gradients. It allows users to create visually appealing gradient meshes with optional noise effects, perfect for enhancing digital artwork, web design, and more.

## Features

- **Gradient Mesh Generation:** Create beautiful 512x512 PNG images with gradient mesh effects.
- **Noise Effects:** Optionally apply noise overlays to add texture and depth to your gradients.
- **Consistent Results:** Use seeding to ensure consistent random number generation for reproducible designs.

## API Usage

Meshy provides a simple and intuitive API endpoint to generate gradient meshes:

### `/api/mesh/[seed]`

- **Method:** `GET`
- **Response Type:** `image/png`
- **Caching:** `public, max-age=31536000` (1 year)

#### Route Params:

- **`seed` (optional):**
  - **Type:** `string`
  - **Default:** `'0'`
  - **Description:** Seeds the random number generator for consistent circle placement and color generation.

#### Query Params:

- **`noise` (optional):**
  - **Type:** `string`
  - **Values:** `0`-`32`
  - **Description:** Apply a noise overlay effect if specified.
- **`sharpen` (optional):**
  - **Type:** `number | boolean`
  - **Description:** Apply sharpening filter. If boolean, uses default sigma.
- **`negate` (optional):**
  - **Type:** `boolean`
  - **Description:** Invert image colors.
- **`gammaIn` (optional):**
  - **Type:** `number`
  - **Description:** Apply input gamma correction.
- **`gammaOut` (optional):**
  - **Type:** `number`
  - **Description:** Apply output gamma correction.
- **`brightness` (optional):**
  - **Type:** `number`
  - **Description:** Adjust image brightness.
- **`saturation` (optional):**
  - **Type:** `number`
  - **Description:** Adjust color saturation.
- **`hue` (optional):**
  - **Type:** `number`
  - **Description:** Adjust hue rotation (degrees).
- **`lightness` (optional):**
  - **Type:** `number`
  - **Description:** Adjust image lightness.
- **`blur` (optional):**
  - **Type:** `number`
  - **Description:** Apply blur filter (sigma).

## Examples

- **Random Mesh:** `/api/mesh`
- **Seeded Mesh:** `/api/mesh/hello`
- **Seeded + Noise:** `/api/mesh/hello?noise=8`
- **Seeded + Noise + Sharpen:** `/api/mesh/hello?noise=8&sharpen=5`


