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
        this.value = defaultValue;
    }

    private handleChange(value: string) {
        this.value = value;
        // Allow user to change the value
        // But prevent dual updates during exec
        if (!this.context.getIsActive()) {
            this.context.onControlChange(
                this.context.graphId,
                this.nodeId,
                this.nodeControl,
                value
            );
        }
    }

    public component() {
        const self = this;

        const _Component: React.FC = () => {
            const [value, setValue] = useState(self.value);

            useEffect(() => {
                const unsub = self.context
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
                return () => {
                    if (unsub) unsub();
                };
            }, [setValue]);

            return self.config.large ?? false ? (
                <Input.TextArea
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value;
                        setValue(v);
                        self.handleChange(v);
                    }}
                    className="c__nodecontrol"
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                        width: "100%",
                        height: "300px",
                        resize: "none",
                    }}
                />
            ) : (
                <Input
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value;
                        setValue(v);
                        self.handleChange(v);
                    }}
                    className="c__nodecontrol"
                    onPointerDown={(e) => e.stopPropagation()}
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
