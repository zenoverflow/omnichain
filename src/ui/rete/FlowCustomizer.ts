import {
    ClassicFlow,
    ConnectionPlugin,
    SocketData,
    getSourceTarget,
} from "rete-connection-plugin";

export class FlowCustomizer {
    public static canMakeConnection(from: SocketData, to: SocketData) {
        const [sourceSocket, targetSocket] = (getSourceTarget(from, to) as [
            any,
            any
        ]) || [null, null];

        if (!sourceSocket || !targetSocket) return false;

        if (
            !sourceSocket.payload.isCompatibleWith(targetSocket.payload) &&
            !targetSocket.payload.isCompatibleWith(sourceSocket.payload)
        ) {
            return false;
        }
        return true;
    }

    public static getFlowBuilder(connectionPlugin: ConnectionPlugin<any, any>) {
        return () =>
            new ClassicFlow({
                canMakeConnection(from, to) {
                    const can = FlowCustomizer.canMakeConnection(from, to);

                    if (!can) connectionPlugin.drop();

                    return can;
                },
            });
    }
}
