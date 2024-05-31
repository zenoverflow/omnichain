import React, { useRef, useMemo, useEffect } from "react";

import type { CAreaPlugin, CNodeEditor } from "../../data/typesRete";

import { useOuterState } from "../../util/ObservableUtilsReact";
import { editorLassoStorage } from "../../state/editor";

type _LassoData = {
    top: number;
    left: number;
    width: number;
    height: number;
};

export const Lasso: React.FC<{
    area: CAreaPlugin;
    editor: CNodeEditor;
}> = ({ area }) => {
    const [lasso] = useOuterState(editorLassoStorage);
    const lassoRef = useRef<any>();

    const coords: _LassoData = useMemo(() => {
        if (!lasso) {
            return {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
            };
        }

        return {
            top: Math.min(lasso.y1, lasso.y2),
            left: Math.min(lasso.x1, lasso.x2),
            width: Math.abs(lasso.x1 - lasso.x2),
            height: Math.abs(lasso.y1 - lasso.y2),
        };
    }, [lasso]);

    useEffect(() => {
        // calculate which editor nodes are inside the selector's box
        if (!lasso || !lassoRef.current) {
            return;
        }

        const nodes = area.nodeViews;

        console.log("Nodes: ", nodes);
        console.log("Lasso: ", lasso);
        // console.log("EditorNodes", editor.getNodes());

        const selectedNodes = Array.from(nodes.entries())
            .filter(([_nodeId, nodeView]) => {
                const nodeRect = nodeView.element.getBoundingClientRect();

                return (
                    nodeRect.left >= Math.min(lasso.x1, lasso.x2) &&
                    nodeRect.right <= Math.max(lasso.x1, lasso.x2) &&
                    nodeRect.top >= Math.min(lasso.y1, lasso.y2) &&
                    nodeRect.bottom <= Math.max(lasso.y1, lasso.y2)
                );
            })
            .map(([nodeId, _nodeView]) => nodeId);

        console.log("Selected nodes: ", JSON.stringify(selectedNodes));

        // TODO: update selection
    }, [area.nodeViews, lasso, coords]);

    if (!lasso) {
        return null;
    }

    return (
        <div
            ref={lassoRef}
            style={{
                position: "fixed",
                zIndex: 9001,
                backgroundColor: "blue",
                opacity: 0.5,
                top: coords.top,
                left: coords.left,
                width: coords.width,
                height: coords.height,
                // make transparent to mouse events
                pointerEvents: "none",
            }}
        ></div>
    );
};
