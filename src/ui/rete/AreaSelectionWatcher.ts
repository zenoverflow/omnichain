import { NodeContextObj } from "../../nodes/context";

import { updateNodeSelection } from "../../state/nodeSelection";

export class AreaSelectionWatcher {
    /**
     * Activate area selection.
     * Plugin must be configured beforehand.
     *
     * @param nodeContext
     */
    public static observe(nodeContext: NodeContextObj): void {
        const { editor, area } = nodeContext;

        if (!editor || !area) return;

        const syncSelection = () => {
            const sel = editor
                .getNodes()
                .filter((n) => n.selected)
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
                        "pointerup",
                        "pointerdown",
                    ] as (typeof context.type)[]
                ).includes(context.type)
            ) {
                syncSelection();
            }
            return context;
        });
    }
}
