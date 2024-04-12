import React from "react";

import { Button } from "antd";

import { ClassicPreset } from "rete";

type ButtonControlOptions = {
    text: string;
    onClick: () => any;
};

export class ButtonControl extends ClassicPreset.Control {
    constructor(public options: ButtonControlOptions) {
        super();
    }

    component() {
        const self = this;

        const ButtonControlComponent: React.FC = () => {
            return (
                <Button
                    className="c__nodecontrol"
                    onPointerDown={(e) => e.stopPropagation()}
                    type="primary"
                    size="large"
                    style={{ width: "100%", color: "#fff" }}
                    onClick={self.options.onClick}
                >
                    {self.options.text}
                </Button>
            );
        };

        return ButtonControlComponent;
    }
}
