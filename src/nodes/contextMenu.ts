import { NodeContextObj } from "./context";
import { deleteNode, duplicateNode } from "../state/editor";
import { showContextMenu } from "../state/editorContextMenu";
import { isGraphActive } from "../state/executor";
import { nodeRegistryStorage } from "../state/nodeRegistry";

const makeRootMenu = (nodeContext: NodeContextObj) => {
    const { editor, area } = nodeContext;

    if (!area) {
        throw new Error("Context menu: area missing!");
    }

    const entrypointsCount = editor!
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
        .map(([key, customNode]) => ({
            key,
            label: key.replace(/Node$/, "").trim(),
            handler: async () => {
                const n = customNode.editorNode(nodeContext);
                await editor!.addNode(n);
                await area.translate(n.id, { x, y });
            },
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    return filtered;
};

const makeNodeMenu = (nodeContext: NodeContextObj, context: any) => {
    return [
        {
            key: "duplicate",
            label: "Duplicate",
            handler: () => duplicateNode(context.id, nodeContext),
        },
        {
            key: "delete",
            label: "Delete",
            handler: () => deleteNode(context.id, nodeContext),
        },
    ];
};

const _makeMenu = (ctx: any, nodeContext: NodeContextObj) => {
    if (ctx === "root") {
        return makeRootMenu(nodeContext);
    }

    return makeNodeMenu(nodeContext, ctx);
};

export const makeContextMenu = (nodeContext: NodeContextObj) => {
    const { editor, area } = nodeContext;
    if (!area) return;

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
            if (isGraphActive(nodeContext.graphId)) return;

            const target = ctx.data.event.target as HTMLElement;
            let menuCtx = findContextMenu(target);
            if (menuCtx) {
                const isRoot = menuCtx === "root";
                if (!isRoot) {
                    menuCtx = editor!.getNode(menuCtx);
                }
                const items = _makeMenu(menuCtx, nodeContext);
                const { clientX, clientY } = ctx.data.event;
                const { layerX, layerY } = ctx.data.event as any;
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
