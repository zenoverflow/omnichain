import { Input } from "antd";
import { ClassicPreset } from "rete";

import type { NodeContextObj } from "../context";

export class TextControl extends ClassicPreset.Control {
    public value = "";

    constructor(
        public nodeId: string,
        public nodeControl: string,
        private config: {
            large?: boolean;
            name?: string;
            initial?: string;
        },
        private context: NodeContextObj
    ) {
        super();
        this.value = config.initial ?? "";
    }

    private handleChange(value: string) {
        this.value = value;
        // Allow user to change the value
        // But prevent dual updates during exec
        if (!this.context.getIsActive()) {
            this.context.onControlChange(
                this.context.pathToGraph,
                this.nodeId,
                this.nodeControl,
                value
            );
        }
    }

    public component() {
        const self = this;

        const _Component: React.FC = () => {
            return self.config.large ?? false ? (
                <Input.TextArea
                    defaultValue={self.value}
                    onChange={(e) => {
                        self.handleChange(e.target.value);
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
                    defaultValue={self.value}
                    onChange={(e) => {
                        self.handleChange(e.target.value);
                    }}
                    className="c__nodecontrol"
                    onPointerDown={(e) => e.stopPropagation()}
                    addonBefore={self.config.name ?? "text"}
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
