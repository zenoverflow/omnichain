import type { CAreaPlugin, CNodeEditor } from "../../data/typesRete";

import { deleteNode, duplicateNode } from "../../state/editor";
import { showContextMenu } from "../../state/editorContextMenu";
import { isGraphActive } from "../../state/executor";
import { nodeRegistryStorage } from "../../state/nodeRegistry";
import { GraphUtils } from "../../util/GraphUtils";

const _makeRootMenu = (
    editor: CNodeEditor,
    area: CAreaPlugin,
    graphId: string
) => {
    const entrypointsCount = editor
        .getNodes()
        .filter((n) => n.label === "StartNode").length;

    const { x, y } = area.area.pointer;

    const filtered = Object.entries(nodeRegistryStorage.get())
        .filter(([key]) => {
            if (key === "StartNode") {
                // Prevent adding more than 1 entrypoint
                return entrypointsCount < 1;
            }
            return true;
        })
        .map(([key, _customNode]) => ({
            key,
            label: key.replace(/Node$/, "").trim(),
            handler: async () => {
                const n = GraphUtils.mkEditorNode(
                    graphId,
                    key,
                    nodeRegistryStorage.get()
                );
                await editor.addNode(n);
                await area.translate(n.id, { x, y });
            },
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    return filtered;
};

const _makeNodeMenu = (context: any) => {
    return [
        {
            key: "duplicate",
            label: "Duplicate",
            handler: () => duplicateNode(context.id),
        },
        {
            key: "delete",
            label: "Delete",
            handler: () => deleteNode(context.id),
        },
    ];
};

const _makeMenu = (
    ctx: any,
    editor: CNodeEditor,
    area: CAreaPlugin,
    graphId: string
) => {
    if (ctx === "root") {
        return _makeRootMenu(editor, area, graphId);
    }

    return _makeNodeMenu(ctx);
};

export const makeContextMenu = (
    editor: CNodeEditor,
    area: CAreaPlugin,
    graphId: string
) => {
    const findContextMenu = (target: HTMLElement): string | null => {
        let dataAttr = target.dataset.contextMenu;
        if (dataAttr) return dataAttr;
        for (
            let parent = target.parentElement;
            parent;
            parent = parent.parentElement
        ) {
            dataAttr = parent.dataset.contextMenu;
            if (dataAttr) return dataAttr;
        }
        return null;
    };

    area.addPipe((ctx) => {
        if (ctx.type === "contextmenu") {
            ctx.data.event.preventDefault();
            if (isGraphActive(graphId)) return;

            const target = ctx.data.event.target as HTMLElement;
            let menuCtx = findContextMenu(target);
            if (menuCtx) {
                const isRoot = menuCtx === "root";
                if (!isRoot) {
                    menuCtx = editor.getNode(menuCtx);
                }
                const items = _makeMenu(menuCtx, editor, area, graphId);
                const { clientX, clientY } = ctx.data.event;
                const { layerX, layerY } = ctx.data.event;
                showContextMenu({
                    items,
                    clientX,
                    clientY,
                    layerX,
                    layerY,
                    isRoot,
                });
            }
        }
        return ctx;
    });
};
