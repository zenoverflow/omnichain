import React from "react";

import { Input } from "antd";

import { ClassicPreset } from "rete";

import { signalEditorUpdate } from "../../state/watcher";

export class TextControl extends ClassicPreset.Control {
    value: string = "";

    ref: any = null;

    constructor(
        public options: {
            id: string;
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

        const TextControlComponent: React.FC = () => {
            return (
                <Input.TextArea
                    id={self.options.id}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                        width: "100%",
                        height: "300px",
                        resize: "none",
                        fontSize: "18px",
                    }}
                    defaultValue={self.value}
                    onChange={(e) => {
                        self.handleUpdate(e.target.value);
                    }}
                />
            );
        };

        return TextControlComponent;
    }
}
