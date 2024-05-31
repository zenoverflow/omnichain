import type { CAreaPlugin, CNodeEditor } from "../../data/typesRete";

import { updateNodeSelection } from "../../state/nodeSelection";
import {
    startEditorLasso,
    setEditorLassoEnd,
    clearEditorLasso,
    editorLassoStorage,
} from "../../state/editor";

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
                        "pointerup",
                        "pointerdown",
                    ] as (typeof context.type)[]
                ).includes(context.type)
            ) {
                syncSelection();
            }
            return context;
        });

        area.addPipe((context) => {
            const data = (context as any).data;
            const event = data.event;

            if (context.type === "translate" && editorLassoStorage.get()) {
                throw new Error("Lasso is active, cannot translate");
            }

            if (
                (
                    [
                        "pointerup",
                        "pointerdown",
                        "pointermove",
                    ] as (typeof context.type)[]
                ).includes(context.type)
            ) {
                if (event && event.shiftKey) {
                    event.stopPropagation();
                    event.preventDefault();

                    if (context.type === "pointerdown") {
                        startEditorLasso(event.clientX, event.clientY);
                    } else if (context.type === "pointermove") {
                        setEditorLassoEnd(event.clientX, event.clientY);
                    }
                }

                if (context.type === "pointerup") {
                    clearEditorLasso();
                }
            }
            return context;
        });
    },
};
