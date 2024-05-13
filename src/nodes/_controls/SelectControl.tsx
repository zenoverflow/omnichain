import { useState, useEffect } from "react";
import { Select } from "antd";
import { ClassicPreset } from "rete";

import type { NodeContextObj } from "../context";

type SelectValue = {
    value: string;
    label: string;
};

export type SelectControlConfig = {
    label?: string;
    showSearch?: boolean;
    values: SelectValue[];
};

export class SelectControl extends ClassicPreset.Control {
    value: string | null = null;

    constructor(
        public nodeId: string,
        public nodeControl: string,
        public defaultValue: string,
        public config: SelectControlConfig,
        private context: NodeContextObj
    ) {
        super();
        this.value = this.grabValue();
    }

    private grabValue() {
        const val = this.context.getControlValue(this.nodeId, this.nodeControl);
        return (val ?? this.defaultValue) as string | null;
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

    component() {
        const self = this;

        const findValueMatch = (v: string | null) =>
            v
                ? self.config.values.find(({ value }) => value === v) ?? null
                : null;

        const _Component: React.FC = () => {
            const [value, setValue] = useState(
                findValueMatch(this.grabValue())
            );
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
                            setValue(findValueMatch(value as string));
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
            // const parentRef = useRef<any>();
            // const [lastUpdate, setLastUpdate] = useState(0);
            return (
                <div
                    // key={lastUpdate}
                    // ref={parentRef}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "stretch",
                            width: "100%",
                        }}
                    >
                        <span
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "0 10px",
                                borderTopLeftRadius: "5px",
                                borderBottomLeftRadius: "5px",
                                backgroundColor: "#fafafa",
                            }}
                        >
                            {self.config.label ?? "Option"}
                        </span>
                        <Select
                            disabled={disabled}
                            value={value}
                            onSelect={(_, option) => {
                                setValue(option);
                                self.handleChange(option.value);
                                // setLastUpdate(Date.now());
                            }}
                            options={self.config.values}
                            className="c__rmleftrad c__nodecontrol"
                            style={{ flex: "1" }}
                            showSearch={self.config.showSearch ?? false}
                            // onSearch={() => {}}
                            // optionFilterProp="children"
                            // filterOption={(input, option) =>
                            //     input.trim().length
                            //         ? option.label
                            //               .toLowerCase()
                            //               .includes(input.toLowerCase())
                            //         : true
                            // }
                        />
                    </div>
                </div>
            );
        };

        return _Component;
    }
}
