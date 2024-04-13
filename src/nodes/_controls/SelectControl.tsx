import { useMemo } from "react";
import { Select } from "antd";
import { ClassicPreset } from "rete";

import type { NodeContextObj } from "../context";

type SelectValue = {
    value: string;
    label: string;
};

export class SelectControl extends ClassicPreset.Control {
    value: string | null = null;

    constructor(
        public nodeId: string,
        public nodeControl: string,
        public config: {
            name?: string;
            showSearch?: boolean;
            values: SelectValue[];
            initial?: string | null;
        },
        private context: NodeContextObj
    ) {
        super();
        this.value = config.initial ?? null;
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

    component() {
        const self = this;

        const _Component: React.FC = () => {
            const defaultValue = useMemo(
                () =>
                    self.value
                        ? self.config.values.find(
                              ({ value }) => value === self.value
                          )
                        : null,
                [self.config.values, self.value]
            );
            // const parentRef = useRef<any>();
            // const [lastUpdate, setLastUpdate] = useState(0);
            return (
                <div
                    // key={lastUpdate}
                    // ref={parentRef}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "stretch",
                            width: "100%",
                        }}
                    >
                        <span
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "0 10px",
                                borderTopLeftRadius: "5px",
                                borderBottomLeftRadius: "5px",
                                backgroundColor: "#fafafa",
                            }}
                        >
                            {self.config.name ?? "Option"}
                        </span>
                        <Select
                            defaultValue={defaultValue}
                            onSelect={(_, option) => {
                                self.handleChange(option.value);
                                // setLastUpdate(Date.now());
                            }}
                            options={self.config.values}
                            className="c__rmleftrad c__nodecontrol"
                            style={{ flex: "1" }}
                            showSearch={self.config.showSearch ?? false}
                            // onSearch={() => {}}
                            // optionFilterProp="children"
                            // filterOption={(input, option) =>
                            //     input.trim().length
                            //         ? option.label
                            //               .toLowerCase()
                            //               .includes(input.toLowerCase())
                            //         : true
                            // }
                        />
                    </div>
                </div>
            );
        };

        return _Component;
    }
}
