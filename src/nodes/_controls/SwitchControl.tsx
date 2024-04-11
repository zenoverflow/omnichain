import React from "react";

import { Switch } from "antd";

import { ClassicPreset } from "rete";

import { signalEditorUpdate } from "../../state/watcher";

export class SwitchControl extends ClassicPreset.Control {
    value = false;

    constructor(
        public options: {
            activeName?: string;
            inactiveName?: string;
            initial?: boolean;
            onUpdate?: () => void;
        }
    ) {
        super();
        this.value = options.initial ?? false;
    }

    component() {
        const self = this;

        const SwitchControlComponent: React.FC = () => {
            return (
                <div onPointerDown={(e) => e.stopPropagation()}>
                    <Switch
                        checkedChildren={self.options.activeName ?? "On"}
                        unCheckedChildren={self.options.inactiveName ?? "Off"}
                        defaultChecked={self.options.initial ?? false}
                        style={{ outline: "#fff 2px solid" }}
                        onChange={(val) => {
                            self.value = val;
                            signalEditorUpdate();
                            if (self.options.onUpdate) {
                                self.options.onUpdate();
                            }
                        }}
                    />
                </div>
            );
        };

        return SwitchControlComponent;
    }
}
