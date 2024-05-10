import { useState, useEffect } from "react";
import { InputNumber } from "antd";
import { ClassicPreset } from "rete";

import type { NodeContextObj } from "../context";

export type NumberControlConfig = {
    label?: string;
    min?: number;
    max?: number;
};

export class NumberControl extends ClassicPreset.Control {
    value: number | null = null;

    constructor(
        public nodeId: string,
        public nodeControl: string,
        public defaultValue: number,
        public config: NumberControlConfig,
        private context: NodeContextObj
    ) {
        super();
        this.value = this.grabValue();
    }

    private grabValue() {
        return (this.context.getControlValue(
            this.context.graphId,
            this.nodeId,
            this.nodeControl
        ) ?? this.defaultValue) as number | null;
    }

    private handleChange(value: number) {
        this.value = value;
        // Allow user to change the value
        // But prevent dual updates during exec
        if (!this.context.getIsActive()) {
            void this.context.onControlChange(
                this.context.graphId,
                this.nodeId,
                this.nodeControl,
                value
            );
        }
    }

    component() {
        const self = this;

        const _Component: React.FC = () => {
            const [value, setValue] = useState(this.grabValue());
            const [disabled, setDisabled] = useState(
                this.context.getControlDisabled(this.context.graphId)
            );

            useEffect(() => {
                const valUnsub = self.context
                    .getControlObservable()
                    ?.subscribe(({ graphId, node, control, value }) => {
                        if (
                            graphId === self.context.graphId &&
                            node === self.nodeId &&
                            control === self.nodeControl
                        ) {
                            setValue(value as number);
                        }
                    });
                const disabledUnsub = self.context
                    .getControlDisabledObservable()
                    ?.subscribe(([graphId, disabled]) => {
                        if (graphId === self.context.graphId) {
                            setDisabled(disabled);
                        }
                    });
                return () => {
                    if (valUnsub) valUnsub();
                    if (disabledUnsub) disabledUnsub();
                };
            }, []);

            return (
                <div
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                    }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <InputNumber
                        disabled={disabled}
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
                        addonBefore={self.config.label ?? undefined}
                        style={{ width: "100%" }}
                    />
                </div>
            );
        };

        return _Component;
    }
}
