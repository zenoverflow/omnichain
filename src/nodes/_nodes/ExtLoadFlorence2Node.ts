import { makeNode } from "./_Base";

export const ExtLoadFlorence2Node = makeNode(
    {
        nodeName: "ExtLoadFlorence2Node",
        nodeIcon: "CodeOutlined",
        dimensions: [380, 340],
        externalModules: ["python"],
        doc: [
            //
            "Load/unload the Florence2 model in OmniChain's external Python module.",
            "You need to install and run the external Python module to use this node.",
            "If the model hasn't been downloaded yet, you will have to wait for the download.",
        ].join(" "),
    },
    {
        inputs: [
            //
            { name: "triggerIn", type: "trigger", label: "trigger in" },
        ],
        outputs: [
            //
            { name: "triggerOut", type: "trigger", label: "trigger out" },
        ],

        controlsOverride: {
            action: "action",
            model: "model",
            device: "device",
        },
        controls: [
            {
                name: "action",
                control: {
                    type: "select",
                    defaultValue: "load",
                    config: {
                        label: "action",
                        values: [
                            { label: "load", value: "load" },
                            { label: "unload", value: "unload" },
                        ],
                    },
                },
            },
            {
                name: "model",
                control: {
                    type: "select",
                    defaultValue: "florence2",
                    config: {
                        label: "model",
                        values: [
                            { label: "Florence2", value: "florence2" },
                            { label: "Florence2-FT", value: "florence2-ft" },
                        ],
                    },
                },
            },
            {
                name: "device",
                control: {
                    type: "text",
                    defaultValue: "cpu",
                    config: {
                        label: "device",
                    },
                },
            },
        ],
    },
    {
        async controlFlow(nodeId, context) {
            try {
                const inputs = await context.fetchInputs(nodeId);
                const controls = context.getControlsWithOverride(
                    nodeId,
                    inputs
                );

                const action = controls.action as string;
                const device = controls.device as string;

                let model: string | null = null;

                switch (controls.model as string) {
                    case "florence2":
                        model = "microsoft/Florence-2-large";
                        break;
                    case "florence2-ft":
                        model = "microsoft/Florence-2-large-ft";
                        break;
                    default:
                        throw new Error("Invalid model");
                }

                await context.extraAction({
                    type: "callExternalModule",
                    args: {
                        module: "python",
                        action: `/florence2/${action}`,
                        data: { device, model },
                    },
                });

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);
