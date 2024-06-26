import React, { useMemo, useEffect } from "react";

import { useOuterState } from "../../util/ObservableUtilsReact";
import { editorLassoStorage, editorStateStorage } from "../../state/editor";

type _LassoData = {
    top: number;
    left: number;
    width: number;
    height: number;
};

export const Lasso: React.FC = () => {
    const [lasso] = useOuterState(editorLassoStorage);

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
        if (!lasso) return;

        const editorState = editorStateStorage.get();

        if (!editorState) return;

        const nodes = editorState.area.nodeViews;

        const lassoLeft = Math.min(lasso.x1, lasso.x2);
        const lassoRight = Math.max(lasso.x1, lasso.x2);
        const lassoTop = Math.min(lasso.y1, lasso.y2);
        const lassoBottom = Math.max(lasso.y1, lasso.y2);

        const selectedNodes = Array.from(nodes.entries())
            .filter(([_nodeId, nodeView]) => {
                const nodeRect = nodeView.element.getBoundingClientRect();

                return (
                    nodeRect.bottom > lassoTop &&
                    nodeRect.right > lassoLeft &&
                    nodeRect.top < lassoBottom &&
                    nodeRect.left < lassoRight
                );

                // Full containment (left here for reference)
                // return (
                //     nodeRect.left >= Math.min(lasso.x1, lasso.x2) &&
                //     nodeRect.right <= Math.max(lasso.x1, lasso.x2) &&
                //     nodeRect.top >= Math.min(lasso.y1, lasso.y2) &&
                //     nodeRect.bottom <= Math.max(lasso.y1, lasso.y2)
                // );
            })
            .map(([nodeId, _nodeView]) => nodeId);

        // Unselect old selection
        for (const id of nodes.keys()) {
            editorState.unselect(id);
        }
        // Select new selection
        for (const id of selectedNodes) {
            editorState.select(id);
        }
    }, [lasso]);

    if (!lasso) {
        return null;
    }

    return (
        <div
            style={{
                position: "fixed",
                zIndex: 9001,
                backgroundColor: "#1677ff",
                opacity: 0.3,
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
