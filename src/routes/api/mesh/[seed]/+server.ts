import { AvatarParams } from '$lib/schema';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import sharp from 'sharp';
import { RateLimiter } from 'sveltekit-rate-limiter/server';

const limiter = new RateLimiter({
  IP: [100, 'h'],
  IPUA: [50, 'm'],
});

// Simple hash function for string seed
function stringHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// Mulberry32 PRNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const GET: RequestHandler = async (event) => {
  const { url, params } = event;
  if (await limiter.isLimited(event)) return error(429);

  const search = AvatarParams.parse({
    noise: url.searchParams.get('noise'),
    sharpen: url.searchParams.get('sharpen'),
    negate: url.searchParams.get('negate'),
    gammaIn: url.searchParams.get('gammaIn'),
    gammaOut: url.searchParams.get('gammaOut'),
    brightness: url.searchParams.get('brightness'),
    saturation: url.searchParams.get('saturation'),
    hue: url.searchParams.get('hue'),
    lightness: url.searchParams.get('lightness'),
    blur: url.searchParams.get('blur'),
  });

  const seed = stringHashCode(params.seed);
  const random = mulberry32(seed);

  // Define the color palette
  const gradientColors = [
    '#ffffff',
    '#fca15e',
    '#5e5ce6',
    '#78c7ff',
    '#d85cf0',
    '#f7dea3',
  ];

  // Generate radial gradient definitions
  let gradientDefs = '';
  gradientColors.forEach((color, index) => {
    const id = `grad${index + 1}`;
    const cx = Math.floor(random() * 101); // Random 0-100%
    const cy = Math.floor(random() * 101); // Random 0-100%
    const r = 50; // Fixed radius 50%

    gradientDefs += `
      <radialGradient id="${id}" cx="${cx}%" cy="${cy}%" r="${r}%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </radialGradient>\n`;
  });

  // Generate rects using the gradients
  let gradientRects = '';
  gradientColors.forEach((_, index) => {
    const id = `grad${index + 1}`;
    gradientRects += `    <rect width="100%" height="100%" fill="url(#${id})" />\n`;
  });


  const svg = `
    <svg width="100%" height="100%" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background base gradient -->
        <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#cfcbe4"/>
          <stop offset="100%" stop-color="#d98ee0"/>
        </linearGradient>

        <!-- Dynamically generated radial gradients -->
        ${gradientDefs.trim()}
      </defs>

      <!-- Base background -->
      <rect width="100%" height="100%" fill="url(#base)" />

      <!-- Layered radial gradients -->
      ${gradientRects.trim()}
    </svg>
  `;

  const svgBuffer = Buffer.from(svg);
  const jpeg = await sharp(svgBuffer).composite(search.noise > 0 ? [
    {
      input: {
        create: {
          width: 512,
          height: 512,
          channels: 3,
          background: {
            r: 255,
            g: 255,
            b: 255
          },
          noise: {
            type: "gaussian",
            mean: 28,
            sigma: search.noise,
          },
        }
      },
      blend: "overlay"
    }
  ] : [])
    .modulate({
      brightness: search.brightness / 100,
      saturation: search.saturation / 100,
      hue: search.hue,
      lightness: search.lightness,
    })
    .gamma(search.gammaIn, search.gammaOut)
    .negate(search.negate ? { alpha: false } : false)
    .blur(search.blur < 0.03 ? false : search.blur)
    .jpeg({ quality: 90 })
    .toBuffer();

  return new Response(jpeg, {
    headers: {
      'Content-Type': 'image/jpeg',
      // Cache for 1 year - adjust if needed
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};