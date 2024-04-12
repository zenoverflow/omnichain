import { NodeContextObj } from "../../nodes/context";

import { updateGraph } from "../../state/graphs";

let debouncerNodeDrag: NodeJS.Timeout | null = null;

let debouncerNodeResize: NodeJS.Timeout | null = null;

let debouncerNodeTranslate: NodeJS.Timeout | null = null;

let debouncerAreaTranslate: NodeJS.Timeout | null = null;

let debouncerAreaReorder: NodeJS.Timeout | null = null;

let debouncerAreaZoom: NodeJS.Timeout | null = null;

export class GraphWatcher {
    public static observe(nodeContext: NodeContextObj) {
        const { editor, area, pathToGraph } = nodeContext;

        if (!editor || !area || !pathToGraph.length) return;

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
                updateGraph(editor, area, pathToGraph);
            }
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
                    // "nodedragged",
                    // "noderesized",
                    // "nodetranslated",
                    // "reordered",
                    // "translated",
                    // "zoomed",
                ].includes(context.type)
            ) {
                updateGraph(editor, area, pathToGraph);
                return context;
            }
            // DEBOUNCED EVENTS
            switch (context.type) {
                case "nodedragged":
                    if (debouncerNodeDrag) {
                        clearTimeout(debouncerNodeDrag);
                    }
                    debouncerNodeDrag = setTimeout(() => {
                        updateGraph(editor, area, pathToGraph);
                    }, 50);
                    break;

                case "noderesized":
                    if (debouncerNodeResize) {
                        clearTimeout(debouncerNodeResize);
                    }
                    debouncerNodeResize = setTimeout(() => {
                        updateGraph(editor, area, pathToGraph);
                    }, 50);
                    break;

                case "nodetranslated":
                    if (debouncerNodeTranslate) {
                        clearTimeout(debouncerNodeTranslate);
                    }
                    debouncerNodeTranslate = setTimeout(() => {
                        updateGraph(editor, area, pathToGraph);
                    }, 50);
                    break;

                case "reordered":
                    if (debouncerAreaReorder) {
                        clearTimeout(debouncerAreaReorder);
                    }
                    debouncerAreaReorder = setTimeout(() => {
                        updateGraph(editor, area, pathToGraph);
                    }, 50);
                    break;

                case "translated":
                    if (debouncerAreaTranslate) {
                        clearTimeout(debouncerAreaTranslate);
                    }
                    debouncerAreaTranslate = setTimeout(() => {
                        updateGraph(editor, area, pathToGraph);
                    }, 50);
                    break;

                case "zoomed":
                    if (debouncerAreaZoom) {
                        clearTimeout(debouncerAreaZoom);
                    }
                    debouncerAreaZoom = setTimeout(() => {
                        updateGraph(editor, area, pathToGraph);
                    }, 50);
                    break;
            }
            return context;
        });
    }
}
