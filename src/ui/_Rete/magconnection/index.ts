import { ClassicPreset } from "rete";
import {
    ConnectionPlugin,
    SocketData,
    createPseudoconnection,
} from "rete-connection-plugin";
import { getElementCenter } from "rete-render-utils";

import type { CAreaPlugin, CNodeEditor } from "../../../data/typesRete";

import { Position, findNearestPoint, isInsideRect } from "./math";
import { getNodeRect } from "./utils";
import { FlowCustomizer } from "../FlowCustomizer";

export { MagneticConnection } from "./MagneticConnection";

type Props = {
    createConnection: (from: SocketData, to: SocketData) => Promise<void>;
    display: (from: SocketData, to: SocketData) => boolean;
    offset: (socket: SocketData, position: Position) => Position;
    margin?: number;
    distance?: number;
};

const _configureMagCon = (
    editor: CNodeEditor,
    area: CAreaPlugin,
    connection: ConnectionPlugin<any, any>,
    props: Props
) => {
    const sockets = new Map<HTMLElement, SocketData>();
    const magneticConnection = createPseudoconnection<any, any>({
        isMagnetic: true,
    });
    const margin = typeof props.margin !== "undefined" ? props.margin : 50;
    const distance =
        typeof props.distance !== "undefined" ? props.distance : 50;

    let picked: null | SocketData = null;
    let nearestSocket: null | (SocketData & Position) = null;

    connection.addPipe(async (context) => {
        if (!context || typeof context !== "object" || !("type" in context))
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return context;

        if (context.type === "connectionpick") {
            picked = context.data.socket;
        } else if (context.type === "connectiondrop") {
            if (nearestSocket && !context.data.created) {
                await props.createConnection(
                    context.data.initial,
                    nearestSocket
                );
            }

            picked = null;
            magneticConnection.unmount(area);
        } else if (context.type === "pointermove") {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            if (!picked) return context;
            const point = context.data.position;
            const nodes = Array.from(area.nodeViews.entries());
            const socketsList = Array.from(sockets.values());

            const rects = nodes.map(([id, view]) => ({
                id,
                ...getNodeRect(editor.getNode(id), view),
            }));
            const nearestRects = rects.filter((rect) =>
                isInsideRect(rect, point, margin)
            );
            const nearestNodes = nearestRects.map(({ id }) => id);
            const nearestSockets = socketsList.filter((item) =>
                nearestNodes.includes(item.nodeId)
            );
            const socketsPositions = await Promise.all(
                nearestSockets.map(async (socket) => {
                    const nodeView = area.nodeViews.get(socket.nodeId);

                    if (!nodeView) throw new Error("node view");

                    const { x, y } = await getElementCenter(
                        socket.element,
                        nodeView.element
                    );

                    return {
                        ...socket,
                        x: x + nodeView.position.x,
                        y: y + nodeView.position.y,
                    };
                })
            );
            nearestSocket =
                findNearestPoint(socketsPositions, point, distance) || null;

            if (nearestSocket && props.display(picked, nearestSocket)) {
                if (!magneticConnection.isMounted())
                    magneticConnection.mount(area);
                const { x, y } = nearestSocket;

                magneticConnection.render(
                    area,
                    props.offset(nearestSocket, { x, y }),
                    picked
                );
            } else if (magneticConnection.isMounted()) {
                magneticConnection.unmount(area);
            }
        } else if (
            context.type === "render" &&
            context.data.type === "socket"
        ) {
            const { element } = context.data;

            sockets.set(element, context.data);
        } else if (context.type === "unmount") {
            sockets.delete(context.data.element);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return context;
    });
};

export const integrateMagCon = (
    editor: CNodeEditor,
    area: CAreaPlugin,
    connection: ConnectionPlugin<any, any>
) => {
    _configureMagCon(editor, area, connection, {
        async createConnection(from, to) {
            if (from.side === to.side) return;
            const [source, target] =
                from.side === "output" ? [from, to] : [to, from];
            const sourceNode = editor.getNode(source.nodeId);
            const targetNode = editor.getNode(target.nodeId);

            if (!FlowCustomizer.canMakeConnection(from, to)) {
                return;
            }

            await editor.addConnection(
                new ClassicPreset.Connection(
                    sourceNode,
                    source.key,
                    targetNode,
                    target.key
                )
            );
        },
        display(from, to) {
            // return from.side !== to.side;
            return (
                from.side !== to.side &&
                FlowCustomizer.canMakeConnection(from, to)
            );
        },
        offset(socket, position) {
            const socketRadius = 9;

            return {
                x:
                    position.x +
                    (socket.side === "input" ? -socketRadius : socketRadius),
                y: position.y,
            };
        },
    });
};
