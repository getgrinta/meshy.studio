import { env } from "$env/dynamic/public";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url, params }) => {
    const seed = params.seed;
    const ogUrl = env.PUBLIC_APP_URL + '/api/mesh/' + seed + url.search;
    return { ogUrl };
};
