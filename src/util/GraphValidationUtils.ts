import Ajv from "ajv";

import type { SerializedGraph } from "../data/types";

export const GraphValidationUtils = {
    validateGraphObj(graph: SerializedGraph): boolean {
        const ajv = new Ajv({
            allowUnionTypes: true,
        });

        const baseConfigSchema = ajv.compile<SerializedGraph>({
            type: "object",
            properties: {
                name: { type: "string" },
                graphId: { type: "string" },
                nodes: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            nodeType: { type: "string" },
                            nodeId: { type: "string" },
                            controls: {
                                type: "object",
                                propertyNames: { type: "string" },
                                patternProperties: {
                                    ".*": {
                                        oneOf: [
                                            { type: "string" },
                                            { type: "number" },
                                            { type: "null" },
                                        ],
                                    },
                                },
                            },
                            positionX: { type: "number" },
                            positionY: { type: "number" },
                        },
                        required: [
                            "nodeType",
                            "nodeId",
                            "controls",
                            "positionX",
                            "positionY",
                        ],
                        additionalProperties: false,
                    },
                },
                connections: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            source: { type: "string" },
                            sourceOutput: { type: "string" },
                            target: { type: "string" },
                            targetInput: { type: "string" },
                        },
                        required: [
                            "source",
                            "sourceOutput",
                            "target",
                            "targetInput",
                        ],
                        additionalProperties: false,
                    },
                },
                zoom: { type: "number" },
                areaX: { type: "number" },
                areaY: { type: "number" },
                created: { type: "number" },
            },
            required: [
                "name",
                "graphId",
                "nodes",
                "connections",
                "zoom",
                "areaX",
                "areaY",
                "created",
            ],
            additionalProperties: false,
        });

        return baseConfigSchema(graph);
    },
};
