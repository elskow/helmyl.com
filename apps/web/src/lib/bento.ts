export type Size = '1x1' | '2x1' | '1x2' | '2x2';

export interface BentoInput {
    size?: Size;
    prefer?: Size;
    featured?: boolean;
    media?: { width: number; height: number };
}

export interface Placement {
    col: number;
    row: number;
    w: number;
    h: number;
}

export interface PackResult {
    placements: Placement[];
    rows: number;
    holes: number;
}
const CANDIDATES: Record<Size, Size[]> = {
    '2x2': ['2x2', '2x1', '1x2', '1x1'],
    '2x1': ['2x1', '1x1', '2x2'],
    '1x2': ['1x2', '1x1', '2x2'],
    '1x1': ['1x1', '2x1', '1x2']
};

const HOLE_COST = 100;
const MAX_SEARCH = 8;

export function inferSize(item: BentoInput): Size {
    if (item.size) return item.size;
    if (item.prefer) return item.prefer;
    if (item.featured) return '2x2';
    if (item.media) {
        const ratio = item.media.width / item.media.height;
        if (ratio >= 1.6) return '2x1';
        if (ratio <= 0.65) return '1x2';
    }
    return '1x1';
}
export function place(sizes: Size[], cols: number): PackResult {
    const occ: boolean[][] = [];
    const taken = (r: number, c: number) => occ[r]?.[c] ?? false;

    const fits = (r: number, c: number, w: number, h: number) => {
        for (let dr = 0; dr < h; dr++)
            for (let dc = 0; dc < w; dc++) if (taken(r + dr, c + dc)) return false;
        return true;
    };

    const mark = (r: number, c: number, w: number, h: number) => {
        for (let dr = 0; dr < h; dr++) {
            const line = (occ[r + dr] ??= Array<boolean>(cols).fill(false));
            for (let dc = 0; dc < w; dc++) line[c + dc] = true;
        }
    };

    const placements = sizes.map((size) => {
        const [sw, h] = size.split('x').map(Number);
        const w = Math.min(sw, cols);
        for (let r = 0; ; r++) {
            for (let c = 0; c + w <= cols; c++) {
                if (fits(r, c, w, h)) {
                    mark(r, c, w, h);
                    return { col: c + 1, row: r + 1, w, h };
                }
            }
        }
    });

    const holes = occ.reduce((n, line) => n + line.filter((x) => !x).length, 0);
    return { placements, rows: occ.length, holes };
}

export function fit(items: BentoInput[], cols: number): PackResult {
    const sizes = items.map(inferSize);
    const resizable = items.flatMap((item, i) => (item.size ? [] : [i])).slice(-MAX_SEARCH);

    let best = { cost: Infinity, sizes: [...sizes] };

    const walk = (k: number, deviation: number) => {
        if (best.cost === 0) return;
        if (k === resizable.length) {
            const cost = place(sizes, cols).holes * HOLE_COST + deviation;
            if (cost < best.cost) best = { cost, sizes: [...sizes] };
            return;
        }
        const i = resizable[k];
        const start = sizes[i];
        CANDIDATES[start].forEach((candidate, rank) => {
            sizes[i] = candidate;
            walk(k + 1, deviation + rank);
        });
        sizes[i] = start;
    };
    walk(0, 0);

    return place(best.sizes, cols);
}

export function layout(items: BentoInput[]) {
    const wide = fit(items, 4);
    const narrow = fit(items, 2);

    for (const [name, result] of [['4-col', wide], ['2-col', narrow]] as const) {
        if (result.holes > 0) {
            console.warn(
                `[bento] ${result.holes} empty cell(s) in the ${name} layout. Unlock a tile or add one that fits.`
            );
        }
    }

    const styles = items.map((_, i) => {
        const a = wide.placements[i];
        const b = narrow.placements[i];
        return `--c4:${a.col};--r4:${a.row};--w4:${a.w};--h4:${a.h};--c2:${b.col};--r2:${b.row};--w2:${b.w};--h2:${b.h}`;
    });

    return { styles };
}
