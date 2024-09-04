import React, { useEffect, useState } from "react";
import { Button, Modal, Space, Select, Input, InputNumber } from "antd";
import { SettingOutlined } from "@ant-design/icons";

import { MediaRecorderUtils } from "../../util/MediaRecorderUtils";
import { useOuterState } from "../../util/ObservableUtilsReact";
import {
    optionsStorage,
    setWhisper,
    setWhisperDevice,
    setWhisperKeepLoaded,
    setWhisperAutoSend,
} from "../../state/options";
import { ExternalModuleUtils } from "../../util/ExternalModuleUtils";

const _Option: React.FC<{
    type: "text" | "number" | "select";
    label: string;
    info: string;
    placeholder?: string;
    value: any;
    options?: { label: string; value: any }[];
    onChange: (v: any) => any;
}> = ({ type, label, info, placeholder, value, options, onChange }) => {
    let inputComponent: JSX.Element | null = null;

    switch (type) {
        case "select":
            inputComponent = (
                <Select
                    style={{ width: "100%" }}
                    placeholder={placeholder || "Select an option"}
                    value={value}
                    options={options}
                    onChange={onChange}
                />
            );
            break;
        case "text":
            inputComponent = (
                <Input
                    style={{ width: "100%" }}
                    placeholder={placeholder || "Enter a value"}
                    value={value}
                    onChange={onChange}
                />
            );
            break;
        case "number":
            inputComponent = (
                <InputNumber
                    style={{ width: "100%" }}
                    placeholder={placeholder || "Enter a number"}
                    value={value}
                    onChange={onChange}
                />
            );
            break;
        default:
            break;
    }

    return (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <span>{label}</span>
            {inputComponent}
            <span
                className="c__mstyle"
                style={{ fontSize: "16px", opacity: 0.7 }}
            >
                {info}
            </span>
        </Space>
    );
};

const SettingsWhisper: React.FC = () => {
    const [options] = useOuterState(optionsStorage);

    return (
        <>
            <_Option
                type="select"
                label="Whisper Model"
                info={[
                    "Whisper model to use for speech recognition in the chat view.",
                    "Note that the first usage of any model will trigger a one-time download of the model.",
                    "The download may take a few minutes depending on the model size.",
                ].join(" ")}
                value={options.whisper}
                options={[
                    // Same as in src/state/options.ts
                    { label: "disabled", value: "disabled" },
                    { label: "tiny.en", value: "tiny.en" },
                    { label: "tiny", value: "tiny" },
                    { label: "base.en", value: "base.en" },
                    { label: "base", value: "base" },
                    { label: "small.en", value: "small.en" },
                    { label: "small", value: "small" },
                    { label: "medium.en", value: "medium.en" },
                    { label: "medium", value: "medium" },
                    { label: "large-v1", value: "large-v1" },
                    { label: "large-v2", value: "large-v2" },
                    { label: "large-v3", value: "large-v3" },
                    { label: "large", value: "large" },
                    { label: "distil-large-v2", value: "distil-large-v2" },
                    {
                        label: "distil-medium.en",
                        value: "distil-medium.en",
                    },
                    { label: "distil-small.en", value: "distil-small.en" },
                    { label: "distil-large-v3", value: "distil-large-v3" },
                ]}
                onChange={(v) => {
                    void setWhisper(v);
                }}
            />
            <_Option
                type="text"
                label="Whisper Device"
                info={[
                    "The device to use for the Whisper model ('cpu' / 'cuda' / etc).",
                ].join(" ")}
                value={options.whisperDevice}
                onChange={(v) => {
                    void setWhisperDevice(v.target.value);
                }}
            />
            <_Option
                type="select"
                label="Keep Whisper Model Loaded"
                info={[
                    "Whether to keep the Whisper model loaded in memory.",
                ].join(" ")}
                value={options.whisperKeepLoaded}
                options={[
                    { label: "yes", value: true },
                    { label: "no", value: false },
                ]}
                onChange={(v) => {
                    void setWhisperKeepLoaded(v);
                }}
            />
            <_Option
                type="select"
                label="Auto-Send Whisper Transcription"
                info={[
                    "Whether to automatically send the transcription as",
                    "a message in the chat view after it is processed.",
                ].join(" ")}
                value={options.whisperAutoSend}
                options={[
                    { label: "yes", value: true },
                    { label: "no", value: false },
                ]}
                onChange={(v) => {
                    void setWhisperAutoSend(v);
                }}
            />

            <Space style={{ width: "100%" }}>
                <Button
                    type="primary"
                    onClick={() => {
                        void MediaRecorderUtils.reloadTranscriptionModel();
                    }}
                >
                    Load/Reload Whisper
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        void MediaRecorderUtils.unloadTranscriptionModel();
                    }}
                    danger
                >
                    Unload Whisper
                </Button>
            </Space>
        </>
    );
};

const _Modal: React.FC<{ closeModal: () => any }> = ({ closeModal }) => {
    const [pythonAvailable, setPythonAvailable] = useState(false);

    useEffect(() => {
        void (async () => {
            const available = await ExternalModuleUtils.pingModule("python");
            setPythonAvailable(available);
        })();
    }, []);

    return (
        <Modal
            title={<h3>Settings</h3>}
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
        >
            <Space
                direction="vertical"
                size="large"
                style={{ width: "100%", marginTop: "10px" }}
            >
                <h4 style={{ margin: "0px" }}>Whisper Settings</h4>
                {pythonAvailable ? (
                    <SettingsWhisper />
                ) : (
                    <span>
                        To use the Whisper model, please install and run the
                        <a
                            href="https://github.com/zenoverflow/omnichain_external_python"
                            target="_blank"
                            rel="noreferrer noopener"
                            style={{
                                marginLeft: "5px",
                                textDecoration: "underline",
                                color: "#1677ff",
                            }}
                        >
                            External Python Module
                        </a>
                    </span>
                )}
            </Space>
        </Modal>
    );
};

export const BtnSettings: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <>
            <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<SettingOutlined />}
                style={{
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                onClick={handleOpenModal}
                disabled={modalOpen}
            />
            {modalOpen ? <_Modal closeModal={handleCloseModal} /> : null}
        </>
    );
};
