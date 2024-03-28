export type RawVector = number[];

export type MemoRelation = {
    id: number;
    similarity: number;
};

export type Memo = {
    id: number;
    text: string;
    vector: RawVector;
    rel: MemoRelation[];
};

export type RelatedMemo = {
    memo: Memo;
    similarity: number;
};

/** Calculate the cosine similarity between two vectors. */
const _calcSimilarity = (vector1: RawVector, vector2: RawVector) => {
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    for (let i = 0; i < vector1.length; i++) {
        dotProduct += vector1[i] * vector2[i];
        magnitude1 += vector1[i] * vector1[i];
        magnitude2 += vector2[i] * vector2[i];
    }
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    return dotProduct / (magnitude1 * magnitude2);
};

export class MemoRex {
    public BASE_TRESHOLD = 0.7;

    constructor(
        //
        private vectors: Memo[] = []
    ) {}

    restore(json: string) {
        this.vectors = JSON.parse(json);
    }

    // TODO: optimizerProcess() to shrink total size

    getJson() {
        return JSON.stringify(this.vectors);
    }

    relatorProcess() {
        const self = this;

        let active = true;
        let timeout: any;

        const step = (ind?: number) => {
            const i = ind ?? this.vectors.length - 1;
            const iNext = self.relatorStep(self.BASE_TRESHOLD, i);

            if (!active) return;

            timeout = setTimeout(() => {
                step(iNext);
            }, 300);
        };

        timeout = setTimeout(() => {
            step();
        }, 300);

        return () => {
            active = false;
            if (timeout) clearTimeout(timeout);
        };
    }

    relatorStep(treshold: number, pastIndex?: number) {
        let ind = pastIndex ?? this.vectors.length - 1;

        if (ind < 0 || ind >= this.vectors.length)
            ind = this.vectors.length - 1;

        const memo = this.vectors[ind];

        memo.rel = this.chainRemember(memo.vector, treshold).map((sv) => ({
            id: sv.memo.id,
            similarity: sv.similarity,
        }));

        memo.rel.sort((a, b) => b.similarity - a.similarity);

        // Next index
        return ind - 1;
    }

    experience(text: string, vector: RawVector) {
        if (this.vectors.length >= Number.MAX_SAFE_INTEGER) {
            throw new Error(
                "problem in experience(); Integer indexing space exceeded!"
            );
        }

        const data: Memo = {
            id: this.vectors.length,
            text,
            vector,
            rel: [],
        };

        this.vectors.push(data);
    }

    chainRemember(
        queryVector: RawVector,
        treshold = 0.7,
        capacity = Number.MAX_SAFE_INTEGER,
        fromPastIndex?: number,
        cachedResults?: RelatedMemo[]
    ) {
        const self = this;
        // Assertions
        if (capacity <= 0 || (fromPastIndex ?? 0) < 0) {
            throw new Error(`bad config in chainRemember()`);
        }

        let results: RelatedMemo[] = cachedResults ?? [];

        const haveCapacity = () => results.length < capacity;

        const sortBySimilarityDesc = () =>
            results.sort((a, b) => b.similarity - a.similarity);

        const isKnown = (index: number) =>
            results.findIndex((r) => r.memo.id === index) !== -1;

        // Auto-adjust treshold
        // for (
        //     let treshold = self.BASE_TRESHOLD;
        //     haveCapacity();
        //     treshold += 0.1
        // ) {
        // }
        // Try to remember starting from recent memories

        for (
            let pastIndex = Math.min(
                self.vectors.length - 1,
                fromPastIndex ?? self.vectors.length
            );
            pastIndex >= 0 && haveCapacity();
            pastIndex--
        ) {
            const memo = self.vectors[pastIndex];

            const s = _calcSimilarity(queryVector, memo.vector);

            if (s >= treshold && !isKnown(memo.id)) {
                // Found target
                results.push({ memo, similarity: s });
            }
        }
        sortBySimilarityDesc();

        // Utilize related memories as shortcuts

        if (haveCapacity() && results.length) {
            for (const targetRel of results) {
                for (const relData of targetRel.memo.rel) {
                    if (
                        relData.similarity >= treshold &&
                        !isKnown(relData.id)
                    ) {
                        // Found target
                        results.push({
                            memo: self.vectors[relData.id],
                            similarity: relData.similarity,
                        });
                        if (!haveCapacity()) break;
                    }
                }
            }

            sortBySimilarityDesc();
        }

        // If capacity left, attempt to recurse
        // if (haveCapacity() && results.length) {
        //     const lastRel = results[results.length - 1];
        //     results = self.chainRemember(
        //         lastRel.memo.vector,
        //         treshold,
        //         capacity,
        //         lastRel.memo.id,
        //         results
        //     );
        // }

        // Order from newest to oldest

        results.sort((a, b) => a.memo.id - b.memo.id);

        // Ensure amount within capacity

        results = results.slice(0, capacity);

        // Order from oldest to newest

        results.reverse();

        return results;
    }
}
