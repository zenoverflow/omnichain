import { Input } from "antd";
import { ClassicPreset } from "rete";

import { signalEditorUpdate } from "../../state/watcher";

export class TextControl extends ClassicPreset.Control {
    value = "";

    constructor(
        public options: {
            id?: string;
            large?: boolean;
            name?: string;
            initial?: string;
        }
    ) {
        super();
        this.value = options.initial ?? "";
    }

    component() {
        const self = this;

        const _Component: React.FC = () => {
            return self.options.large ?? false ? (
                <Input.TextArea
                    className="c__nodecontrol"
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                        width: "100%",
                        height: "300px",
                        resize: "none",
                        // fontSize: "18px",
                    }}
                    defaultValue={self.value}
                    onChange={(e) => {
                        self.value = e.target.value;
                        signalEditorUpdate();
                    }}
                    {...(self.options.id ? { id: self.options.id } : {})}
                />
            ) : (
                <Input
                    className="c__nodecontrol"
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
                        self.value = e.target.value;
                        signalEditorUpdate();
                    }}
                    {...(self.options.id ? { id: self.options.id } : {})}
                />
            );
        };

        return _Component;
    }
}
