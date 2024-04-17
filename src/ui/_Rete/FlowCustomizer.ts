import {
    ClassicFlow,
    ConnectionPlugin,
    SocketData,
    getSourceTarget,
} from "rete-connection-plugin";

export const FlowCustomizer = {
    canMakeConnection(from: SocketData, to: SocketData) {
        const [sourceSocket, targetSocket] = getSourceTarget(from, to) || [
            null,
            null,
        ];

        if (!sourceSocket || !targetSocket) return false;

        if (
            !(sourceSocket as any).payload.isCompatibleWith(
                (targetSocket as any).payload
            ) &&
            !(targetSocket as any).payload.isCompatibleWith(
                (sourceSocket as any).payload
            )
        ) {
            return false;
        }
        return true;
    },

    getFlowBuilder(connectionPlugin: ConnectionPlugin<any, any>) {
        return () =>
            new ClassicFlow({
                canMakeConnection(from, to) {
                    const can = FlowCustomizer.canMakeConnection(from, to);

                    if (!can) connectionPlugin.drop();

                    return can;
                },
            });
    },
};
