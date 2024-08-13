export const RandomNumberUtils = {
    arbitrary(min: number, max: number) {
        if (min > max) {
            throw new Error(
                "GenerateRandomNumberNode: min cannot be greater than max!"
            );
        }

        return Math.random() * (max - min) + min;
    },

    integer(min: number, max: number) {
        if (min > max) {
            throw new Error(
                "GenerateRandomNumberNode: min cannot be greater than max!"
            );
        }

        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);

        return (
            Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled
        );
    },
};
