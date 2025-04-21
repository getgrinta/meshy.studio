import qs from "qs";
import type { RequestHandler } from "./$types";
import { OgDataSchema } from "$lib/schema";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { convert } from "colorizr";
import colors from "tailwindcss/colors";

export const GET: RequestHandler = async ({ url }) => {
    const searchParams = qs.parse(
        url.search.length > 0 ? url.search.substring(1) : ""
    );
    const ogData = OgDataSchema.parse(searchParams);
    const mode = ogData.darkMode ? "dark" : "light";
    const filename = `${ogData.template}-${mode}.jpg`;
    const templatePath = new URL(
        `../../../../static/og/${filename}`,
        import.meta.url
    );
    const templateBuffer = await readFile(templatePath);
    const descriptionMargin = ogData.title.length > 36 ? 56 : 0;
    const titleColor = ogData.darkMode ? convert(colors.gray[200], 'hex') : convert(colors.gray[800], 'hex')
    const textColor = ogData.darkMode ? convert(colors.gray[300], 'hex') : convert(colors.gray[700], 'hex')
    const jpeg = await sharp(templateBuffer)
        .composite([
            {
                input: templateBuffer,
                create: {
                    width: 600,
                    height: 600,
                    channels: 3,
                    background: { r: 255, g: 255, b: 255, alpha: 1 },
                }
            },
            {
                input: {
                    text: {
                        text: `<span font-family="Inter" foreground="${textColor}" font_weight="600">${ogData.branding}</span>`,
                        rgba: true,
                        width: 600,
                        dpi: 140,
                        spacing: 20,
                        font: "Inter, sans-serif",
                    },
                },
                left: 80,
                top: 200,
            },
            {
                input: {
                    text: {
                        text: `<span font-family="Inter" foreground="${titleColor}" font_weight="600">${ogData.title}</span>`,
                        rgba: true,
                        width: 600,
                        dpi: 200,
                        spacing: 20,
                        font: "Inter, sans-serif",
                    },
                },
                left: 80,
                top: 280,
            },
            {
                input: {
                    text: {
                        text: `<span font-family="Inter" foreground="${textColor}">${ogData.description}</span>`,
                        rgba: true,
                        width: 600,
                        dpi: 140,
                        font: "Inter, sans-serif",
                        spacing: 20
                    },
                },
                left: 80,
                top: 360 + descriptionMargin,
            },
        ])
        .jpeg({ quality: 90 })
        .toBuffer();
    return new Response(jpeg, {
        headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
};
