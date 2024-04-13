import { useState, useEffect } from "react";
import { InputNumber } from "antd";
import { ClassicPreset } from "rete";

import type { NodeContextObj } from "../context";

export class NumberControl extends ClassicPreset.Control {
    value: number | null = null;

    constructor(
        public nodeId: string,
        public nodeControl: string,
        public config: {
            name?: string;
            initial?: number;
            min?: number;
            max?: number;
        },
        private context: NodeContextObj
    ) {
        super();
        this.value = config.initial ?? undefined;
    }

    private handleChange(value: number) {
        this.value = value;
        // Allow user to change the value
        // But prevent dual updates during exec
        if (!this.context.getIsActive()) {
            this.context.onControlChange(
                this.context.pathToGraph,
                this.nodeId,
                this.nodeControl,
                value
            );
        }
    }

    component() {
        const self = this;

        const _Component: React.FC = () => {
            const [value, setValue] = useState(self.value);

            useEffect(() => {
                const unsub = self.context
                    .getControlObservable()
                    ?.subscribe(({ pathToGraph, node, control, value }) => {
                        if (
                            pathToGraph[0] === self.context.pathToGraph[0] &&
                            pathToGraph[1] === self.context.pathToGraph[1] &&
                            node === self.nodeId &&
                            control === self.nodeControl
                        ) {
                            setValue(value as number);
                        }
                    });
                return () => {
                    if (unsub) unsub();
                };
            }, [setValue]);

            return (
                <div
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <InputNumber
                        value={value}
                        onChange={(val) => {
                            const v = val ?? self.config.min ?? 0;
                            setValue(v);
                            self.handleChange(v);
                            // self.value = val ?? self.config.min ?? 0;
                            // signalEditorUpdate();
                        }}
                        min={self.config.min ?? undefined}
                        max={self.config.max ?? undefined}
                        className="c__nodecontrol"
                        addonBefore={self.config.name ?? undefined}
                        style={{ width: "100%" }}
                    />
                </div>
            );
        };

        return _Component;
    }
}
