import { ClassicPreset } from "rete";
import { OpenAIOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { StringSocket } from "../_sockets/StringSocket";
import { StringArraySocket } from "../_sockets/StringArraySocket";
import { TextControl } from "../_controls/TextControl";
import { SelectControl } from "../_controls/SelectControl";
import { NumberControl } from "../_controls/NumberControl";

export class OpenAIPrompterNode extends ClassicPreset.Node<
    { prompt: StringSocket },
    { results: StringArraySocket },
    {
        model: TextControl;
        maxTokens: NumberControl;
        temperature: NumberControl;
        topP: NumberControl;
        frequencyPenalty: NumberControl;
        presencePenalty: NumberControl;
        numResponses: NumberControl;
        echo: SelectControl;
        seed: NumberControl;
    }
> {
    public static icon = OpenAIOutlined;
    width = 380;
    height = 570;

    constructor(
        private context: NodeContextObj,
        id?: string,
        controls?: Record<string, any>
    ) {
        super(OpenAIPrompterNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        this.addInput(
            "prompt",
            new ClassicPreset.Input(new StringSocket(), "prompt")
        );
        this.addOutput(
            "results",
            new ClassicPreset.Output(new StringArraySocket(), "results")
        );
        //
        this.addControl(
            "model",
            new TextControl(
                self.id,
                "model",
                {
                    name: "model",
                    initial: controls?.model ?? "gpt-3.5-turbo-instruct",
                },
                context
            )
        );
        this.addControl(
            "maxTokens",
            new NumberControl(
                self.id,
                "maxTokens",
                {
                    name: "max_tokens",
                    initial: controls?.maxTokens ?? 120,
                    min: 1,
                },
                context
            )
        );
        this.addControl(
            "temperature",
            new NumberControl(
                self.id,
                "temperature",
                {
                    name: "temperature",
                    initial: controls?.temperature ?? 1.0,
                    min: 0,
                    max: 2.0,
                },
                context
            )
        );
        this.addControl(
            "topP",
            new NumberControl(
                self.id,
                "topP",
                {
                    name: "top_p",
                    initial: controls?.topP ?? 1.0,
                    min: 0.01,
                    max: 1.0,
                },
                context
            )
        );
        this.addControl(
            "frequencyPenalty",
            new NumberControl(
                self.id,
                "frequencyPenalty",
                {
                    name: "frequency_penalty",
                    initial: controls?.frequencyPenalty ?? 0,
                    min: -2.0,
                    max: 2.0,
                },
                context
            )
        );
        this.addControl(
            "presencePenalty",
            new NumberControl(
                self.id,
                "presencePenalty",
                {
                    name: "presence_penalty",
                    initial: controls?.presencePenalty ?? 0,
                    min: -2.0,
                    max: 2.0,
                },
                context
            )
        );
        this.addControl(
            "numResponses",
            new NumberControl(
                self.id,
                "numResponses",
                {
                    name: "num_responses",
                    initial: controls?.numResponses ?? 120,
                    min: 1,
                },
                context
            )
        );
        this.addControl(
            "echo",
            new SelectControl(
                self.id,
                "echo",
                {
                    name: "echo",
                    initial: controls?.echo ?? "false",
                    values: [
                        { value: "true", label: "true" },
                        { value: "false", label: "false" },
                    ],
                },
                context
            )
        );
        this.addControl(
            "seed",
            new NumberControl(
                self.id,
                "seed",
                {
                    name: "seed",
                    initial: controls?.seed ?? undefined,
                },
                context
            )
        );
        //
        // self.context.control.add(self, {
        //     inputs: () => ["trigger"],
        //     outputs: () => [],
        //     async execute(_: "trigger") {
        //         if (!self.context.getIsActive()) return;

        //         self.context.onFlowNode(self.id);

        //         // const inputs = (await self.context.dataflow.fetchInputs(
        //         //     self.id
        //         // )) as {
        //         //     data: any[];
        //         // };

        //         self.context.onFlowNode(self.id);

        //         // console.log(`LogNode:`, inputs.data[0]);
        //     },
        // });
        self.context.dataflow.add(self, {
            inputs: () => ["data"],
            outputs: () => ["results"],
            data() {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                return {};
            },
        });
    }
}
