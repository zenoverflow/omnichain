import React from "react";
import { ClassicPreset } from "rete";

import { signalEditorUpdate } from "../../state/watcher";

export class HiddenControl extends ClassicPreset.Control {
    value: string = "";

    constructor(
        public options: {
            initial?: string;
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
        const FauxControlComponent: React.FC = () => {
            return <></>;
        };
        return FauxControlComponent;
    }
}
