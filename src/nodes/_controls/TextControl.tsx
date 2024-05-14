import { Input } from "antd";

import { BaseControl, useControlState } from "./_Control";

export type TextControlConfig = {
    large?: boolean;
    label?: string;
};

export class TextControl extends BaseControl<string, TextControlConfig> {
    public component() {
        const self = this;

        const _Component: React.FC = () => {
            const controlState = useControlState(
                self.graphId,
                self.nodeId,
                self.controlName,
                self.grabValue()
            );

            if (controlState.hidden) return null;

            return self.config.large ?? false ? (
                <Input.TextArea
                    disabled={controlState.disabled}
                    value={controlState.value}
                    onChange={(e) => {
                        const v = e.target.value;
                        controlState.setValue(v);
                        self.value = v;
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
                    disabled={controlState.disabled}
                    value={controlState.value}
                    onChange={(e) => {
                        const v = e.target.value;
                        self.value = v;
                        controlState.setValue(v);
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
