import { env } from "$env/dynamic/public";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
    const ogUrl = env.PUBLIC_APP_URL + '/api/og' + url.search;
    return { ogUrl };
};
