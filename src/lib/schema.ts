import { z } from "zod";
import { PRIMARY_COLOR } from "./const";

export function getRandomSeed() {
    return Math.random().toString(36).substring(2, 15)
}

const booleanSchema = z.enum(["true", "false"]).transform((value) => value === "true")
const primaryColorSchema = z.enum(PRIMARY_COLOR)

export const AvatarParams = z.object({
    noise: z.coerce.number().min(0).max(32).default(8),
    sharpen: z.coerce.number().min(0.1).max(10).default(0.1),
    negate: booleanSchema.default('false'),
    gammaIn: z.coerce.number().min(1).max(3).default(2.2),
    gammaOut: z.coerce.number().min(1).max(3).default(2.2),
    brightness: z.coerce.number().min(0).max(100).default(100),
    saturation: z.coerce.number().min(0).max(100).default(100),
    hue: z.coerce.number().min(0).max(360).default(0),
    lightness: z.coerce.number().min(0).max(100).default(0),
    blur: z.coerce.number().min(0).max(80).default(0),
    text: z.string().default(""),
});

export type AvatarProps = z.infer<typeof AvatarParams>

export const ChartDataSchema = z.object({
    data: z.array(z.object({
        x: z.string(),
        y: z.coerce.number()
    })).default([{ x: "", y: 1 }]),
    darkMode: booleanSchema.default('false'),
    primaryColor: primaryColorSchema.default('blue'),
    borderRadius: z.coerce.number().min(0).max(32).default(8),
    barMargin: z.coerce.number().min(0).max(0.75).default(0.05),
    caption: z.string().default("")
})

export type ChartData = z.infer<typeof ChartDataSchema>