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
        top_p: NumberControl;
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
            new TextControl({
                name: "model",
                initial: controls?.model ?? "gpt-3.5-turbo-instruct",
            })
        );
        this.addControl(
            "maxTokens",
            new NumberControl({
                name: "max_tokens",
                initial: controls?.maxTokens ?? 120,
                min: 1,
            })
        );
        this.addControl(
            "temperature",
            new NumberControl({
                name: "temperature",
                initial: controls?.temperature ?? 1.0,
                min: 0,
                max: 2.0,
            })
        );
        this.addControl(
            "top_p",
            new NumberControl({
                name: "top_p",
                initial: controls?.top_p ?? 1.0,
                min: 0.01,
                max: 1.0,
            })
        );
        this.addControl(
            "frequencyPenalty",
            new NumberControl({
                name: "frequency_penalty",
                initial: controls?.frequencyPenalty ?? 0,
                min: -2.0,
                max: 2.0,
            })
        );
        this.addControl(
            "presencePenalty",
            new NumberControl({
                name: "presence_penalty",
                initial: controls?.presencePenalty ?? 0,
                min: -2.0,
                max: 2.0,
            })
        );
        this.addControl(
            "numResponses",
            new NumberControl({
                name: "num_responses",
                initial: controls?.numResponses ?? 120,
                min: 1,
            })
        );
        this.addControl(
            "echo",
            new SelectControl({
                name: "echo",
                values: [
                    { value: "true", label: "true" },
                    { value: "false", label: "false" },
                ],
                initial: controls?.echo ?? "false",
            })
        );
        this.addControl(
            "seed",
            new NumberControl({
                name: "seed",
                initial: controls?.seed ?? undefined,
            })
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
