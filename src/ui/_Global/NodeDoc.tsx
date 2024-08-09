import { Space } from "antd";
import type { CustomNode } from "../../data/typesCustomNodes";

const _typeLabelStyle: React.CSSProperties = {
    backgroundColor: "lightgray",
    borderRadius: "6px",
    padding: "3px 10px",
    marginLeft: "5px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
};

export const NodeDoc: React.FC<{ node: CustomNode }> = ({ node }) => {
    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <div style={{ width: "100%" }}>{node.config.baseConfig.doc}</div>
            <Space direction="vertical" style={{ width: "100%" }}>
                <span style={{ fontWeight: "bold" }}>Inputs:</span>
                {node.config.ioConfig.inputs.map((i) => (
                    <span key={i.name}>
                        {i.label || i.name}
                        <span style={_typeLabelStyle}>{i.type}</span>
                    </span>
                ))}
            </Space>
            <Space direction="vertical" style={{ width: "100%" }}>
                <span style={{ fontWeight: "bold" }}>Outputs:</span>
                {node.config.ioConfig.outputs.map((i) => (
                    <span key={i.name}>
                        {i.label || i.name}
                        <span style={_typeLabelStyle}>{i.type}</span>
                    </span>
                ))}
            </Space>
            {node.config.ioConfig.controlsOverride ? (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        flexWrap: "wrap",
                        rowGap: "5px",
                    }}
                >
                    <span style={{ fontWeight: "bold" }}>Overrides:</span>
                    {Object.keys(node.config.ioConfig.controlsOverride).map(
                        (i) => (
                            <span key={i} style={_typeLabelStyle}>
                                {i}
                            </span>
                        )
                    )}
                </div>
            ) : null}
        </Space>
    );
};
