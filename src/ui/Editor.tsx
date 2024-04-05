import React, { useMemo, useState } from "react";
import { useAtom } from "jotai";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    CommentOutlined,
    BellOutlined,
} from "@ant-design/icons";
import { Button, Layout, Space } from "antd";

import { Sider } from "./Sider";
import { EditorGraph } from "./EditorGraph";
import { ChatInterface } from "./Chat";
import { BtnOptions } from "./_Header/BtnOptions";
import { BtnAvatars } from "./_Header/BtnAvatars";

import { executorAtom } from "../state/executor";
import { closeEditor } from "../state/editor";
import { editorStateAtom } from "../state/editor";

const { Header, Content } = Layout;

const EditorContent: React.FC = () => {
    const [{ path: editorPath }] = useAtom(editorStateAtom);

    const [executor] = useAtom(executorAtom);

    const key = useMemo(() => {
        const k1 = editorPath.join("__");
        const k2 = Object.keys(executor).join("__");
        return `${k1}__${k2}`;
    }, [editorPath, executor]);

    return (
        <Content
            id="TheEditor"
            key={key}
            style={{
                margin: 0,
                padding: 0,
                overflow: "auto",
                height: "100%",
                position: "relative",
                animation: "fadeIn .5s",
            }}
        >
            {editorPath.length > 0 ? <EditorGraph /> : <ChatInterface />}
        </Content>
    );
};

export const Editor: React.FC = () => {
    const [siderCollapsed, setSiderCollapsed] = useState(false);
    const [{ path: editorPath }] = useAtom(editorStateAtom);

    return (
        <Layout style={{ height: "100vh", maxHeight: "100vh" }}>
            <Header
                style={{
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingLeft: 10,
                    paddingRight: 10,
                    color: "#f2f2f2",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={() => setSiderCollapsed(!siderCollapsed)}
                >
                    {siderCollapsed ? (
                        <MenuUnfoldOutlined style={{ fontSize: "32px" }} />
                    ) : (
                        <MenuFoldOutlined style={{ fontSize: "32px" }} />
                    )}
                </div>
                <Space align="center">
                    {editorPath.length > 0 ? (
                        <Button
                            type="primary"
                            size="large"
                            onClick={closeEditor}
                            icon={<CommentOutlined />}
                        >
                            {"Chat"}
                        </Button>
                    ) : null}
                    <Space align="center">
                        <Button
                            type="primary"
                            shape="circle"
                            size="large"
                            icon={<BellOutlined />}
                            style={{
                                display: "inline-flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        />
                        <BtnAvatars />
                        <BtnOptions />
                    </Space>
                </Space>
            </Header>
            <Layout style={{ background: "#343541" }} hasSider>
                <Sider
                    collapsed={siderCollapsed}
                    setCollapsed={setSiderCollapsed}
                />
                <EditorContent />
            </Layout>
        </Layout>
    );
};
