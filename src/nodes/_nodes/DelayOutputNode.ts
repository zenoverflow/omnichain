import { makeNode } from "./_Base";

export const DelayOutputNode = makeNode(
    {
        nodeName: "DelayOutputNode",
        nodeIcon: "HourglassOutlined",
        dimensions: [280, 170],
        doc: "Delay output of data by a specified number of milliseconds.",
    },
    {
        inputs: [{ name: "dataIn", type: "string", label: "data" }],
        outputs: [{ name: "dataOut", type: "string", label: "data" }],
        controls: [
            {
                name: "millis",
                control: {
                    type: "number",
                    defaultValue: 1000,
                    config: {
                        label: "milliseconds",
                        min: 1,
                    },
                },
            },
        ],
    },
    {
        dataFlow: {
            inputs: ["dataIn"],
            outputs: ["dataOut"],
            async logic(_node, _context, controls, fetchInputs) {
                const inputs = (await fetchInputs()) as {
                    dataIn?: string[];
                };
                await new Promise((r) =>
                    setTimeout(r, controls["millis"] as number)
                );
                return { dataOut: (inputs.dataIn || [""])[0] };
            },
        },
    }
);
