import { afterNavigate, pushState } from "$app/navigation";
import qs from 'qs'

function watchSearch(handler: (newSearch: string) => void) {
    const observable = () => document.location.search;
    let oldValue = observable();
    const observer = new MutationObserver(() => {
        const newValue = observable();
        if (oldValue !== newValue) {
            handler(newValue);
            oldValue = newValue;
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
}

const JSONWithoutQuotes = {
    serialize: (value: any) => JSON.stringify(value).replace(/^"|"$/g, ''),
    deserialize: (value: string) => JSON.parse(`"${value}"`)
}

export class SearchWatcher {
    #searchString = $state<string>('');

    constructor() {
        if (typeof window === "undefined") return;

        this.#searchString = location.search;

        watchSearch((newSearch) => {
            this.#searchString = newSearch;
        });
    }

    get searchString() {
        return this.#searchString;
    }
}

type Serializer<T> = {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
};

export class QueryState<T = string> {
    #current = $state<T | undefined>(undefined);
    #searchParam: string;
    #serializer: Serializer<T>;

    constructor(searchParam: string, initialValue?: T, serializer?: Serializer<T>) {
        this.#searchParam = searchParam;
        this.#current = initialValue;
        this.#serializer = serializer ?? { serialize: JSONWithoutQuotes.serialize, deserialize: JSONWithoutQuotes.deserialize };

        if (typeof window === "undefined") return;

        this.syncSearch();

        const unsub = watchSearch(() => {
            this.syncSearch()
        });

        afterNavigate(() => {
            unsub();
        });
    }

    private getSearch() {
        return location.search.length > 0 ? location.search.substring(1) : ""
    }

    private syncSearch() {
        const searchParams = qs.parse(this.getSearch());
        if (!searchParams[this.#searchParam]) return
        const stringified = searchParams[this.#searchParam]?.toString() ?? "";
        this.#current = this.#serializer.deserialize(stringified);
    }

    private setParam(value: T) {
        const query = qs.parse(this.getSearch());
        const serializedProperty = this.#serializer.serialize(value);
        query[this.#searchParam] = serializedProperty;
        const serializedQuery = qs.stringify(query);
        pushState("?" + serializedQuery, '');
    }

    get current() {
        if (!this.#current) throw new Error('QueryState current value is undefined');
        return this.#current
    }

    set current(value: T) {
        this.#current = value;
        this.setParam(value);
    }
}

// const chartData = new QueryState<ChartData[]>("data", [], {
//     serialize: (value) => value.map(({ x, y }) => `${x}:${y}`).join(","),
//     deserialize: (value) =>
//       value.split(",").map((entry) => {
//         const [x, y] = entry.split(":");
//         return { x, y: Number(y ?? 0) };
//       }),
//   });