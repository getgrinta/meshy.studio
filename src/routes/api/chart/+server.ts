import sharp from "sharp";
import { wave } from "@wavekit/wave"
import type { RequestHandler } from "./$types";
import qs from "qs";
import { ChartDataSchema } from "$lib/schema";
import { convert } from 'colorizr';
import colors from "tailwindcss/colors";

export const GET: RequestHandler = async ({ url }) => {
    const searchParams = qs.parse(url.search.length > 0 ? url.search.substring(1) : '')
    const chartData = ChartDataSchema.parse(searchParams)
    const textColor = chartData.darkMode ? convert(colors[chartData.primaryColor][200], 'hex') : convert(colors.neutral[700], 'hex')
    const invertedTextColor = chartData.darkMode ? convert(colors.neutral[700], 'hex') : convert(colors[chartData.primaryColor][200], 'hex')
    const svg = wave.svg({
        version: "1.1",
        xmlns: "http://www.w3.org/2000/svg",
        xmlnsXlink: "http://www.w3.org/1999/xlink",
        viewBox: "0 0 800 600",
        width: "800",
        height: "600"
    }, (svg) => {
        // Add centered caption if present
        svg.rect({ width: "100%", height: "100%", fill: chartData.darkMode ? "#000000" : "#ffffff" });
        // Add a linear gradient definition for the bars
        svg.defs((defs) => {
            const lightColor = chartData.darkMode ? convert(colors[chartData.primaryColor][300], 'hex') : convert(colors[chartData.primaryColor][500], 'hex')
            const darkColor = chartData.darkMode ? convert(colors[chartData.primaryColor][500], 'hex') : convert(colors[chartData.primaryColor][700], 'hex')
            defs.linearGradient({ id: "bar-gradient", x1: "0%", y1: "0%", x2: "0%", y2: "100%" }, (grad) => {
                grad.stop({ offset: "0%", 'stop-color': lightColor }); // light red
                grad.stop({ offset: "100%", 'stop-color': darkColor }); // dark red
            });
        });
        svg.g({ width: "640", height: "440", viewBox: "0 0 640 440", transform: "translate(80, 80)" }, (g) => {
            const N = chartData.data.length;
            const containerWidth = 640;
            const barMargin = chartData.barMargin * containerWidth;
            const totalMargin = (N > 1) ? (N - 1) * barMargin : 0;
            const barWidth = (containerWidth - totalMargin) / N;
            const yMax = Math.max(...chartData.data.map(d => d.y));
            chartData.data.forEach(({ x, y }, i) => {
                const barX = i * (barWidth + barMargin);
                const barHeight = y / yMax * 440;
                // Top left and top right border radius
                const barXPos = barX;
                const barYPos = 440 - barHeight;
                const w = barWidth;
                const h = barHeight;
                // Clamp radius if bar is too small
                const r = Math.min(chartData.borderRadius, w / 2, h);
                // SVG path for top corners rounded only
                const d = [
                    `M${barXPos + r},${barYPos}`,
                    `H${barXPos + w - r}`,
                    `A${r},${r} 0 0 1 ${barXPos + w},${barYPos + r}`,
                    `V${barYPos + h}`,
                    `H${barXPos}`,
                    `V${barYPos + r}`,
                    `A${r},${r} 0 0 1 ${barXPos + r},${barYPos}`,
                    'Z'
                ].join(' ');
                g.path({ d, fill: "url(#bar-gradient)" });

                // Add value label (y) inside the bar at the bottom
                g.text({
                    x: `${barXPos + w / 2}`,
                    y: `${barYPos + h - 6}`,
                    'text-anchor': "middle",
                    'font-size': "20",
                    fill: y === 0 ? textColor : invertedTextColor,
                    'dominant-baseline': "ideographic",
                    "font-weight": "600",
                    "font-family": "Inter, sans-serif"
                }, String(y));

                // Add x label under the bar
                g.text({
                    x: `${barXPos + w / 2}`,
                    y: "460",
                    'text-anchor': "middle",
                    'font-size': "16",
                    fill: textColor,
                    'dominant-baseline': "hanging",
                    "font-weight": '600',
                    "font-family": "Inter, sans-serif"
                }, x);
            });
        })
        svg.text({
            x: "10", // 10px from left edge
            y: "590", // 10px from bottom edge
            'font-size': "16",
            fill: chartData.darkMode ? convert(colors.gray[600], 'hex') : convert(colors.gray[400], 'hex'),
            'font-family': "Inter, sans-serif",
            'font-weight': "600",
        }, chartData.label);
        // Subtle watermark in bottom-right
        svg.text({
            x: "790", // 10px from right edge
            y: "590", // 10px from bottom edge
            'text-anchor': "end",
            'font-size': "16",
            fill: chartData.darkMode ? convert(colors.gray[600], 'hex') : convert(colors.gray[400], 'hex'),
            'font-family': "Inter, sans-serif",
            'font-weight': "600",
        }, "meshy.studio");
        if (chartData.caption) {
            svg.text({
                x: "400",
                y: "48",
                'text-anchor': "middle",
                'font-size': "20",
                fill: textColor,
                'font-family': "Inter, sans-serif",
                'font-weight': "700",
            }, chartData.caption.trim());
        }
    })
    const svgBuffer = Buffer.from(svg.toString());
    const jpeg = await sharp(svgBuffer).jpeg({ quality: 90 }).toBuffer();
    return new Response(jpeg, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}