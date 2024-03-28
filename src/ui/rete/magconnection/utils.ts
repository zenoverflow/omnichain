import { NodeView } from "rete-area-plugin";

export const getNodeRect = (node: any, view: NodeView) => {
    const {
        position: { x, y },
    } = view;

    return {
        left: x,
        top: y,
        right: x + node.width,
        bottom: y + node.height,
    };
};
