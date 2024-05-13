import { useEffect, useState } from "react";
import { Input } from "antd";
import { ClassicPreset } from "rete";

import type { NodeContextObj } from "../context";

export type TextControlConfig = {
    large?: boolean;
    label?: string;
};

export class TextControl extends ClassicPreset.Control {
    public value: string;

    constructor(
        public nodeId: string,
        public nodeControl: string,
        public defaultValue: string,
        private config: TextControlConfig,
        private context: NodeContextObj
    ) {
        super();
        this.value = this.grabValue();
    }

    private grabValue() {
        const val = this.context.getControlValue(this.nodeId, this.nodeControl);
        return (val ?? this.defaultValue) as string;
    }

    private handleChange(value: string) {
        this.value = value;
        // Allow user to change the value
        // But prevent dual updates during exec
        if (!this.context.getFlowActive()) {
            void this.context.onControlChange(
                this.nodeId,
                this.nodeControl,
                value
            );
        }
    }

    public component() {
        const self = this;

        const _Component: React.FC = () => {
            const [value, setValue] = useState(this.grabValue());
            const [disabled, setDisabled] = useState(
                this.context.getFlowActive()
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
                            setValue(value as string);
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
            }, [setValue]);

            return self.config.large ?? false ? (
                <Input.TextArea
                    disabled={disabled}
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value;
                        setValue(v);
                        self.handleChange(v);
                    }}
                    className="c__nodecontrol"
                    onPointerDown={(e) => {
                        e.stopPropagation();
                    }}
                    style={{
                        width: "100%",
                        height: "300px",
                        resize: "none",
                    }}
                />
            ) : (
                <Input
                    disabled={disabled}
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value;
                        setValue(v);
                        self.handleChange(v);
                    }}
                    className="c__nodecontrol"
                    onPointerDown={(e) => {
                        e.stopPropagation();
                    }}
                    addonBefore={self.config.label ?? "text"}
                    styles={{
                        prefix: {
                            backgroundColor: "#fafafa",
                        },
                    }}
                    style={{ width: "100%" }}
                />
            );
        };

        return _Component;
    }
}
