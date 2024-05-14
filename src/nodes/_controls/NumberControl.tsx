import { InputNumber } from "antd";

import { BaseControl, useControlState } from "./_Control";

export type NumberControlConfig = {
    label?: string;
    min?: number;
    max?: number;
};

export class NumberControl extends BaseControl<
    number | null,
    NumberControlConfig
> {
    component() {
        const self = this;

        const NumberControlComponent: React.FC = () => {
            const controlState = useControlState(
                self.graphId,
                self.nodeId,
                self.controlName,
                self.grabValue()
            );

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
                        disabled={controlState.disabled}
                        value={controlState.value}
                        onChange={(val) => {
                            const v = val ?? self.config.min ?? 0;
                            self.value = v;
                            controlState.setValue(v);
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

        return NumberControlComponent;
    }
}
