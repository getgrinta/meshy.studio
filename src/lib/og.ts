import dedent from "dedent";
import type { OgData } from "./schema";

export function buildSyntax({ flavor, formData, baseUrl }: { flavor: "sveltekit" | "nextjs" | "tanstack", formData: OgData, baseUrl: string }) {
    if (flavor === "sveltekit") {
        return dedent`
            <script lang="ts">
                const title = "${formData.title}";
                const description = "${formData.description}";
            </script>

            <svelte:head>
                <title>{title}</title>
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={\`${baseUrl}?template=${formData.template}&darkMode=${formData.darkMode}&branding=${formData.branding}&title=\${title}&description=\${description}\`} />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
            </svelte:head>
        `;
    }
    if (flavor === "nextjs") {
        return dedent`
            import Head from 'next/head'

            // Settings
            const title = "${formData.title}";
            const description = "${formData.description}";

            // Template
            <Head>
                <title>{title}</title>
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={\`${baseUrl}?template=${formData.template}&darkMode=${formData.darkMode}&branding=${formData.branding}&title=\${title}&description=\${description}\`} />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
            </Head>
        `;
    }
    if (flavor === "tanstack") {
        return dedent`
            import { createRootRoute } from '@tanstack/react-router'

            const title = "${formData.title}";
            const description = "${formData.description}";

            export const Route = createRootRoute({
                head: () => ({
                    meta: [
                        { title },
                        { property: "og:title", content: title },
                        { property: "og:description", content: description },
                        { property: "og:image", content: \`${baseUrl}?template=${formData.template}&darkMode=${formData.darkMode}&branding=${formData.branding}&title=\${title }& description=\${description}\` },
                        { property: "og:image:type", content: "image/jpeg" },
                        { property: "og:image:width", content: "1200" },
                        { property: "og:image:height", content: "630" }
                    ]
                })
            })
        `;
    }
    return "";
}