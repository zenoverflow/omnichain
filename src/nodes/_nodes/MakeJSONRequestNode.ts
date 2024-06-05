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

                if (!method || !url) {
                    throw new Error("Missing required inputs!");
                }

                const abortSignal =
                    controls.timeout === 0
                        ? undefined
                        : AbortSignal.timeout(controls.timeout as number);

                const req: RequestInit = {
                    method,
                };

                const reqHeaders = JSON.parse(headers);

                if (Object.keys(reqHeaders).length > 0) {
                    req.headers = reqHeaders;
                }

                if (body?.length > 0) {
                    req.body = body;
                    req.headers = {
                        "Content-Type": "application/json",
                        ...reqHeaders,
                    };
                }

                if (abortSignal !== undefined) {
                    req.signal = abortSignal;
                }

                const result = await fetch(url, req);

                let resultData = await result.text();

                try {
                    resultData = JSON.parse(resultData);
                } catch (error) {
                    // ignore, data is allowed to be non-JSON
                }

                return {
                    result: JSON.stringify({
                        code: result.status,
                        data: resultData,
                        error: null,
                    }),
                };
            } catch (error: any) {
                console.error(error);
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
