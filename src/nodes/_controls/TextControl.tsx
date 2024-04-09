import React from "react";
import { Input } from "antd";
import { ClassicPreset } from "rete";

import { signalEditorUpdate } from "../../state/watcher";

export class TextControl extends ClassicPreset.Control {
    value: string = "";

    constructor(
        public options: {
            id?: string;
            large?: boolean;
            name?: string;
            initial?: string;
            readonly?: boolean;
            onUpdate?: () => void;
        }
    ) {
        super();
        this.value = options.initial ?? "";
    }

    handleUpdate(value: any) {
        const self = this;
        self.value = value;
        signalEditorUpdate();
        if (self.options.onUpdate) {
            self.options.onUpdate();
        }
    }

    component() {
        const self = this;

        const _Component: React.FC = () => {
            return self.options.large ?? false ? (
                <Input.TextArea
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                        width: "100%",
                        height: "300px",
                        resize: "none",
                        // fontSize: "18px",
                    }}
                    defaultValue={self.value}
                    onChange={(e) => {
                        self.handleUpdate(e.target.value);
                    }}
                    {...(self.options.id ? { id: self.options.id } : {})}
                />
            ) : (
                <Input
                    addonBefore={self.options.name ?? "text"}
                    styles={{
                        prefix: {
                            backgroundColor: "#fafafa",
                        },
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                        width: "100%",
                    }}
                    defaultValue={self.value}
                    onChange={(e) => {
                        self.handleUpdate(e.target.value);
                    }}
                    {...(self.options.id ? { id: self.options.id } : {})}
                />
            );
        };

        return _Component;
    }
}
