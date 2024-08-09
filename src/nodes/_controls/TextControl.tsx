import { useMemo, useState } from "react";
import { Input, Button, Modal } from "antd";
import { FullscreenOutlined } from "@ant-design/icons";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";

import { BaseControl, useControlState } from "./_Control";

export type TextControlConfig = {
    large?: boolean;
    label?: string;
    modalSyntaxHighlight?: "json" | "markdown" | "javascript";
};

const _Modal: React.FC<{
    closeModal: () => any;
    value: string;
    onChange: (v: string) => any;
    modalSyntaxHighlight?: string;
}> = ({ closeModal, value, onChange, modalSyntaxHighlight }) => {
    const syntax = useMemo(() => {
        switch (modalSyntaxHighlight) {
            case "json":
                return (code: string) =>
                    Prism.highlight(code, Prism.languages.json, "json");
            case "markdown":
                return (code: string) =>
                    Prism.highlight(code, Prism.languages.markdown, "markdown");
            case "javascript":
                return (code: string) =>
                    Prism.highlight(
                        code,
                        Prism.languages.javascript,
                        "javascript"
                    );
            default:
                return (code: string) => code;
        }
    }, [modalSyntaxHighlight]);
    return (
        <Modal
            title={<div style={{ height: "30px" }} />}
            open={true}
            afterClose={closeModal}
            // onOk={handleApply}
            onCancel={closeModal}
            footer={() => <></>}
            // footer={(_, { OkBtn, CancelBtn }) => (
            //     <>
            //         {/* <CancelBtn />
            //         <OkBtn /> */}
            //     </>
            // )}
            width={"90vw"}
            style={{ top: "10px" }}
        >
            <Editor
                highlight={syntax}
                textareaClassName="cm-editor cm-focused"
                value={value}
                onPointerDown={(e) => {
                    e.stopPropagation();
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                }}
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
                onKeyUp={(e) => {
                    e.stopPropagation();
                }}
                onValueChange={(val) => {
                    onChange(val);
                }}
            />
        </Modal>
    );
};

export class TextControl extends BaseControl<string, TextControlConfig> {
    public component() {
        const self = this;

        const _Component: React.FC = () => {
            const controlState = useControlState(
                self.graphId,
                self.nodeId,
                self.controlName,
                self.grabValue()
            );

            const [modalOpen, setModalOpen] = useState(false);

            if (controlState.hidden) return null;

            return self.config.large ?? false ? (
                <>
                    <Input.TextArea
                        disabled={self.readOnly || controlState.disabled}
                        value={controlState.value}
                        onChange={(e) => {
                            const v = e.target.value;
                            self.value = v;
                            controlState.setValue(v);
                        }}
                        className="c__nodecontrol"
                        onPointerDown={(e) => {
                            e.stopPropagation();
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                        }}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                        }}
                        onKeyUp={(e) => {
                            e.stopPropagation();
                        }}
                        style={{
                            width: "100%",
                            height: "300px",
                            resize: "none",
                        }}
                    />
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button
                            type="primary"
                            size="middle"
                            style={{
                                marginTop: "10px",
                                padding: "0px 5px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#fafafa",
                            }}
                            onMouseUp={(e) => {
                                e.stopPropagation();
                                setModalOpen(true);
                            }}
                            disabled={
                                self.readOnly ||
                                controlState.disabled ||
                                modalOpen
                            }
                        >
                            <FullscreenOutlined style={{ color: "#000" }} />
                        </Button>
                    </div>
                    {modalOpen ? (
                        <_Modal
                            modalSyntaxHighlight={
                                self.config.modalSyntaxHighlight
                            }
                            closeModal={() => {
                                setModalOpen(false);
                            }}
                            value={controlState.value}
                            onChange={(v) => {
                                self.value = v;
                                controlState.setValue(v);
                            }}
                        />
                    ) : null}
                </>
            ) : (
                <Input
                    disabled={self.readOnly || controlState.disabled}
                    value={controlState.value}
                    onChange={(e) => {
                        const v = e.target.value;
                        self.value = v;
                        controlState.setValue(v);
                    }}
                    className="c__nodecontrol"
                    onPointerDown={(e) => {
                        e.stopPropagation();
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                    onKeyUp={(e) => {
                        e.stopPropagation();
                    }}
                    addonBefore={self.config.label ?? "text"}
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
