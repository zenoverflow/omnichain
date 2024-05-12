import { NumberControl } from "./_controls/NumberControl";
import { TextControl } from "./_controls/TextControl";
import { SelectControl } from "./_controls/SelectControl";

export const renderControl = (payload: any) => {
    const makers = [
        //
        NumberControl,
        TextControl,
        SelectControl,
    ];

    for (const Maker of makers) {
        if (payload instanceof Maker) {
            return payload.component();
        }
    }

    throw new Error(`Invalid renderControl payload ${JSON.stringify(payload)}`);
};
