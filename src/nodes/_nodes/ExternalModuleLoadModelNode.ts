import { makeNode } from "./_Base";

const doc = [
    //
    "Load/unload a model via an external OmniChain module.",
    "The module needs to be running on a port accessible to the server.",
    "The server also needs to be configured to use the correct url if it",
    "is not the default url.",
]
    .join(" ")
    .trim();

export const ExternalModuleLoadModelNode = makeNode(
    {
        nodeName: "ExternalModuleLoadModelNode",
        nodeIcon: "CodeOutlined",
        dimensions: [380, 390],
        doc,
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
            module: "module",
            model: "model",
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
                name: "module",
                control: {
                    type: "select",
                    defaultValue: "python",
                    config: {
                        label: "module",
                        values: [
                            // TODO: Add more modules here eventually
                            { label: "Python", value: "python" },
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
                            // TODO: Add more modules here eventually
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
                const module = controls.module as string;
                const model = controls.model as string;
                const device = controls.device as string;

                let modelPath = model;
                let modelId: string | null = null;

                switch (model) {
                    case "florence2":
                        modelPath = "florence2";
                        modelId = "microsoft/Florence-2-large";
                        break;
                    case "florence2-ft":
                        modelPath = "florence2";
                        modelId = "microsoft/Florence-2-large-ft";
                        break;
                    default:
                        break;
                }

                await context.extraAction({
                    type: "callExternalModule",
                    args: {
                        module: module as any,
                        action: `/${modelPath}/${action}`,
                        data: {
                            device,
                            model: modelId,
                        },
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
