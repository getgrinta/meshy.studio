import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { getRandomSeed } from "$lib/schema";

export const load: PageLoad = async () => {
    const seed = getRandomSeed()
    return redirect(302, `/mesh/${seed}`)
}
