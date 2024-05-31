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
        // calculate which editor nodes are inside the selector's box
        if (!lasso) return;

        const area = editorStateStorage.get()?.area;

        if (!area) return;

        const nodes = area.nodeViews;

        // console.log("Nodes: ", nodes);
        // console.log("Lasso: ", lasso);

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

        console.log("Selected nodes: ", JSON.stringify(selectedNodes));

        // TODO: update selection
    }, [lasso]);

    if (!lasso) {
        return null;
    }

    return (
        <div
            // ref={lassoRef}
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
