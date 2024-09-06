import { makeNode } from "./_Base";

export const ExtCallPythonModuleNode = makeNode(
    {
        nodeName: "ExtCallPythonModuleNode",
        nodeIcon: "CodeOutlined",
        dimensions: [350, 230],
        doc: [
            //
            "Call a custom Python function defined in OmniChain's external Python module.",
            "You need to install and run the external Python module to use this node.",
            "Functions are defined in the `custom_modules` directory of the external Python module",
            "and are exposed as FastAPI routes, so you have the full freedom of FastAPI to",
            "define their behavior. All you need is to define a top-level setup function inside which",
            "you define one or more route. The first route segment is considered the module name,",
            "and the second is considered the name of the action. For a quick start, you can copy",
            "the code from the example inside the `custom_modules` directory. To pass parameters to",
            "this node, connect one or more slot nodes to the `params` slot.",
        ].join(" "),
        externalModules: ["python"],
    },
    {
        inputs: [
            //
            { name: "params", type: "slot", label: "params", multi: true },
        ],
        outputs: [
            //
            { name: "result", type: "string", label: "result" },
        ],
        controls: [
            {
                name: "module",
                control: {
                    type: "text",
                    defaultValue: "example",
                    config: {
                        label: "module",
                    },
                },
            },
            {
                name: "action",
                control: {
                    type: "text",
                    defaultValue: "echo",
                    config: {
                        label: "action",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = (await context.fetchInputs(nodeId)) as {
                params?: {
                    name: string;
                    value: string;
                }[];
            };
            const controls = context.getAllControls(nodeId);

            const params = inputs.params || [];

            const paramObj = Object.fromEntries(
                params.map((p) => [p.name, p.value])
            );

            const result = await context.extraAction({
                type: "callExternalModule",
                args: {
                    module: "python",
                    action: `${controls.module}/${controls.action}`,
                    data: Object.keys(paramObj).length ? paramObj : undefined,
                },
            });

            return {
                result:
                    typeof result === "string"
                        ? result
                        : JSON.stringify(result),
            };
        },
    }
);
