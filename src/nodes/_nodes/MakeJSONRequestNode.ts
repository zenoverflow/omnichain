import { makeNode } from "./_Base";

const doc = [
    //
    "Make a request to any JSON-compatible API.",
    "Returns its response as a JSON string, in the format",
    "{code: number, data: any, error: string}.",
    "If something goes wrong with the request configuration",
    "itself (before making the request), the error will be in",
    "the 'error' field, and the code will be 0.",
    "The timeout can be set to 0 to disable it (default).",
]
    .join(" ")
    .trim();

export const MakeJSONRequestNode = makeNode(
    {
        nodeName: "MakeJSONRequestNode",
        nodeIcon: "ApiOutlined",
        dimensions: [620, 290],
        doc,
    },
    {
        inputs: [
            {
                //
                name: "headers",
                type: "string",
                label: "headers (json)",
            },
            {
                //
                name: "body",
                type: "string",
                label: "body (json)",
            },
            {
                //
                name: "method",
                type: "string",
                label: "method",
            },
            {
                //
                name: "url",
                type: "string",
                label: "url",
            },
        ],
        outputs: [
            //
            { name: "result", type: "string", label: "result" },
        ],
        controls: [
            {
                name: "timeout",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "timeout (ms)",
                        min: 0,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            try {
                // Validate inputs
                const headers = (inputs.headers || [])[0] || "{}";
                const body = (inputs.body || [])[0];
                const method = (inputs.method || [])[0];
                const url = (inputs.url || [])[0];

                if (!body || !method || !url) {
                    throw new Error("Missing required inputs!");
                }

                const defaultHeaders = {
                    "Content-Type": "application/json",
                };

                const reqHeaders = {
                    ...defaultHeaders,
                    ...JSON.parse(headers),
                };

                const abortSignal =
                    controls.timeout === 0
                        ? undefined
                        : AbortSignal.timeout(controls.timeout as number);

                const result = await fetch(url, {
                    method,
                    headers: reqHeaders,
                    body,
                    signal: abortSignal,
                });

                let resultData: any = null;

                try {
                    resultData = await result.json();
                } catch (error) {
                    resultData = await result.text();
                }

                return {
                    result: JSON.stringify({
                        code: result.status,
                        data: resultData,
                        error: null,
                    }),
                };
            } catch (error: any) {
                return {
                    result: JSON.stringify({
                        code: error.status || 0,
                        data: null,
                        error: error.message || error,
                    }),
                };
            }
        },
    }
);
