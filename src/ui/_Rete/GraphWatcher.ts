import type { CNodeEditor, CAreaPlugin } from "../../data/typesRete";

import { updateGraph } from "../../state/graphs";

let debouncerNodeResize: NodeJS.Timeout | null = null;

let debouncerNodeTranslate: NodeJS.Timeout | null = null;

let debouncerAreaTranslate: NodeJS.Timeout | null = null;

let debouncerAreaReorder: NodeJS.Timeout | null = null;

let debouncerAreaZoom: NodeJS.Timeout | null = null;

export const GraphWatcher = {
    observe(graphId: string, editor: CNodeEditor, area: CAreaPlugin) {
        if (!editor || !area || !graphId) return;

        editor.addPipe((context) => {
            if (
                (
                    [
                        "nodecreated",
                        "noderemoved",
                        "connectioncreated",
                        "connectionremoved",
                        "cleared",
                    ] as (typeof context.type)[]
                ).includes(context.type)
            ) {
                updateGraph(editor, area, graphId, "pipe 1");
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return context;
        });

        area.addPipe((context) => {
            // NORMAL EVENTS
            if (
                [
                    "nodecreated",
                    "noderemoved",
                    "connectioncreated",
                    "connectionremoved",
                    "cleared",
                ].includes(context.type)
            ) {
                updateGraph(editor, area, graphId, "pipe 2");
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return context;
            }
            // DEBOUNCED EVENTS
            switch (context.type) {
                // DO NOT USE, CAUSES FALSE UPDATE ON SELECT
                // case "nodedragged":

                case "noderesized":
                    if (debouncerNodeResize) {
                        clearTimeout(debouncerNodeResize);
                    }
                    debouncerNodeResize = setTimeout(() => {
                        updateGraph(editor, area, graphId, "pipe 4");
                    }, 50);
                    break;

                case "nodetranslated":
                    if (debouncerNodeTranslate) {
                        clearTimeout(debouncerNodeTranslate);
                    }
                    debouncerNodeTranslate = setTimeout(() => {
                        updateGraph(editor, area, graphId, "pipe 5");
                    }, 50);
                    break;

                case "reordered":
                    if (debouncerAreaReorder) {
                        clearTimeout(debouncerAreaReorder);
                    }
                    debouncerAreaReorder = setTimeout(() => {
                        updateGraph(editor, area, graphId, "pipe 6");
                    }, 50);
                    break;

                case "translated":
                    if (debouncerAreaTranslate) {
                        clearTimeout(debouncerAreaTranslate);
                    }
                    debouncerAreaTranslate = setTimeout(() => {
                        updateGraph(editor, area, graphId, "pipe 7");
                    }, 50);
                    break;

                case "zoomed":
                    if (debouncerAreaZoom) {
                        clearTimeout(debouncerAreaZoom);
                    }
                    debouncerAreaZoom = setTimeout(() => {
                        updateGraph(editor, area, graphId, "pipe 8");
                    }, 50);
                    break;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return context;
        });
    },
};
