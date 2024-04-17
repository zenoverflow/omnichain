import { NodeContextObj } from "../../nodes/context";

import { updateNodeSelection } from "../../state/nodeSelection";

export const AreaSelectionWatcher = {
    /**
     * Activate area selection.
     * Plugin must be configured beforehand.
     *
     * @param nodeContext
     */
    observe(nodeContext: NodeContextObj): void {
        const { editor, area } = nodeContext;

        if (!area) return;

        const syncSelection = () => {
            const sel = editor
                .getNodes()
                .filter((n) => n.selected)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                .map((n) => n.id);
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
