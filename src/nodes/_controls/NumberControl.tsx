import React from "react";

import { InputNumber } from "antd";

import { ClassicPreset } from "rete";

import { signalEditorUpdate } from "../../state/watcher";

export class NumberControl extends ClassicPreset.Control {
    value: number = 0;

    constructor(
        public options: {
            name?: string;
            initial?: number;
            readonly?: boolean;
            min?: number;
            max?: number;
            onUpdate?: () => void;
        }
    ) {
        super();
        this.value = options.initial ?? 0;
    }

    component() {
        const self = this;

        const NumberControlComponent: React.FC = () => {
            return (
                <div
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                    }}
                >
                    <InputNumber
                        onPointerDown={(e) => e.stopPropagation()}
                        addonBefore={self.options.name ?? undefined}
                        min={self.options.min ?? undefined}
                        max={self.options.max ?? undefined}
                        defaultValue={self.value}
                        style={{ width: "100%" }}
                        onChange={(val) => {
                            self.value = val ?? self.options.min ?? 0;
                            signalEditorUpdate();
                            if (self.options.onUpdate) {
                                self.options.onUpdate();
                            }
                        }}
                    />
                </div>
            );
        };

        return NumberControlComponent;
    }
}
