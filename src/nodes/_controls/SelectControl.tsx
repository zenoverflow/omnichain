import React, { useRef, useState } from "react";

import { Select } from "antd";

import { ClassicPreset } from "rete";

import { signalEditorUpdate } from "../../state/watcher";

export class SelectControl extends ClassicPreset.Control {
    value: any | null = null;

    constructor(
        public options: {
            values: {
                value: any;
                label: string;
            }[];
            initial?: string | null;
            readonly?: boolean;
            onUpdate?: () => void;
        }
    ) {
        super();
        this.value = options.initial ?? null;
    }

    component() {
        const self = this;

        const TextControlComponent: React.FC = () => {
            const defaultValue = self.value
                ? self.options.values.find(
                      ({ value }) =>
                          value[0] === self.value[0] &&
                          value[1] === self.value[1]
                  )
                : null;
            const parentRef = useRef<any>();
            const [lastUpdate, setLastUpdate] = useState(0);
            return (
                <div
                    key={lastUpdate}
                    ref={parentRef}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Select
                        showSearch
                        placeholder="choose module"
                        // optionFilterProp="children"
                        style={{ width: "100%" }}
                        defaultValue={defaultValue}
                        onSelect={(_, option) => {
                            self.value = option.value;
                            signalEditorUpdate();
                            if (self.options.onUpdate) {
                                self.options.onUpdate();
                            }
                            setLastUpdate(Date.now());
                        }}
                        onSearch={() => {}}
                        filterOption={(
                            input: string,
                            option?: { label: string; value: string }
                        ) =>
                            input.trim().length
                                ? (option?.label ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                : true
                        }
                        options={self.options.values}
                    />
                </div>
            );
        };

        return TextControlComponent;
    }
}
