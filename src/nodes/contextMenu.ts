import {
    EntrypointNode,
    ModuleInputNode,
    ModuleOutputNode,
    LogOutputNode,
    ModuleNode,
    DelayOutputNode,
    TextNode,
    AutoTextSlicerNode,
} from ".";

import { NodeContextObj } from "./context";
import { deleteNode, duplicateNode } from "../state/editor";
import { showContextMenu } from "../state/editorContextMenu";
import { isGraphActive } from "../state/executor";

export const NODE_MAKERS = {
    EntrypointNode,
    LogOutputNode,
    TextNode,
    DelayOutputNode,
    AutoTextSlicerNode,
    ModuleNode,
    ModuleInputNode,
    ModuleOutputNode,
};

export type CtxMenuCategory = "Basic" | "Content" | "Modules";

const CATEGORIES = ["Basic", "Content", "Modules"];

const _CATEGORIZER: Record<string, CtxMenuCategory> = {
    [EntrypointNode.name]: "Basic",
    [LogOutputNode.name]: "Basic",
    [TextNode.name]: "Content",
    [DelayOutputNode.name]: "Content",
    [AutoTextSlicerNode.name]: "Content",
    [ModuleNode.name]: "Modules",
    [ModuleInputNode.name]: "Modules",
    [ModuleOutputNode.name]: "Modules",
};

const makeRootMenu = (nodeContext: NodeContextObj) => {
    const { pathToGraph, editor, area } = nodeContext;

    if (!editor || !area) {
        throw new Error("Context menu: editor/area missing!");
    }

    const moduleOutputsCount = editor
        .getNodes()
        .filter((n) => n instanceof ModuleOutputNode).length;

    const { x, y } = area.area.pointer;

    const filtered = Object.entries(NODE_MAKERS)
        .filter(([key]) => {
            if (pathToGraph.length === 1) {
                // Block module-specific nodes in main graph
                return ![ModuleInputNode.name, ModuleOutputNode.name].includes(
                    key
                );
            }
            if (pathToGraph.length === 2) {
                // Prevent adding more than one module output
                if (key === ModuleOutputNode.name) {
                    return moduleOutputsCount < 1;
                }
                // Block stuff inside modules
                // TODO: add missing nodes
                return ![ModuleNode.name, EntrypointNode.name].includes(key);
            }
            return true;
        })
        .map(([key, Maker]) => ({
            key,
            label: key.replace("Node", "").trim(),
            handler: async () => {
                const n = new (Maker as any)(nodeContext);
                await editor.addNode(n);
                await area.translate(n.id, { x, y });
            },
        }));

    const categorized: any[] = CATEGORIES.map((CATEGORY, i) => ({
        key: `${i}__${CATEGORY}`,
        label: CATEGORY,
        handler: () => null,
        subitems: filtered.filter(({ key }) => _CATEGORIZER[key] === CATEGORY),
    }));
    const uncategorized: any[] = filtered.filter(
        ({ key }) => !_CATEGORIZER[key]
    );

    return [...categorized, ...uncategorized];
};

const makeNodeMenu = (nodeContext: NodeContextObj, context: any) => {
    const target = nodeContext.editor.getNode(context.id);

    if (target.label === EntrypointNode.name) {
        throw new Error("EntrypointNode cannot be duplicated or deleted!");
    }

    if (target.label === ModuleOutputNode.name) {
        throw new Error("ModuleOutputNode cannot be duplicated or deleted!");
    }

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
            if (isGraphActive(nodeContext.pathToGraph[0])) return;

            const target = ctx.data.event.target as HTMLElement;
            let menuCtx = findContextMenu(target);
            if (menuCtx) {
                if (menuCtx !== "root") {
                    menuCtx = editor.getNode(menuCtx);
                }
                const items = _makeMenu(menuCtx, nodeContext);
                const { clientX, clientY } = ctx.data.event;
                const { layerX, layerY } = ctx.data.event as any;
                showContextMenu({ items, clientX, clientY, layerX, layerY });
            }
        }
        return ctx;
    });
};
