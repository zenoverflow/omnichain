import { useMemo } from "react";
import { Select } from "antd";

import { BaseControl, useControlState } from "./_Control";

export type SelectControlConfig = {
    label?: string;
    showSearch?: boolean;
    values: {
        value: string;
        label: string;
    }[];
};

export class SelectControl extends BaseControl<
    string | null,
    SelectControlConfig
> {
    component() {
        const self = this;

        const findValueMatch = (val: string | null) =>
            val
                ? self.config.values.find(({ value }) => value === val) ?? null
                : null;

        const _Component: React.FC = () => {
            const controlState = useControlState(
                self.graphId,
                self.nodeId,
                self.controlName,
                self.grabValue()
            );

            const selectedOption = useMemo(
                () => findValueMatch(controlState.value),
                [controlState.value]
            );

            if (controlState.hidden) return null;

            return (
                <div
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
                            disabled={controlState.disabled}
                            value={selectedOption}
                            onSelect={(_, option) => {
                                self.value = option.value;
                                controlState.setValue(option.value);
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
