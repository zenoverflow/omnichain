import type { CAreaPlugin, CNodeEditor } from "../../data/typesRete";

import { updateNodeSelection } from "../../state/nodeSelection";

export const AreaSelectionWatcher = {
    /**
     * Activate area selection.
     * Plugin must be configured beforehand.
     *
     * @param nodeContext
     */
    observe(editor: CNodeEditor, area: CAreaPlugin): void {
        const syncSelection = () => {
            const sel = editor
                .getNodes()
                .filter((n) => n.selected as boolean)
                .map((n) => n.id as string);
            updateNodeSelection(sel);
        };

        editor.addPipe((context) => {
            if (
                (
                    [
                        "nodecreated",
                        "noderemoved",
                        "cleared",
                    ] as (typeof context.type)[]
                ).includes(context.type)
            ) {
                syncSelection();
            }
            return context;
        });

        area.addPipe((context) => {
            if (
                (
                    [
                        "nodepicked",
                        // "pointerup",
                        // "pointerdown",
                    ] as (typeof context.type)[]
                ).includes(context.type)
            ) {
                syncSelection();
            }
            return context;
        });
    },
};
