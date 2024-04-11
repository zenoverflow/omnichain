import React, { useEffect, useState } from "react";
import { Layout, Menu, MenuProps } from "antd";
import { useAtom } from "jotai";

import { graphStorageAtom } from "../state/graphs";
import { editorStateAtom, openPath } from "../state/editor";

import { ItemIcon } from "./_Sider/ItemIcon";
import { BtnCreateGraph } from "./_Sider/BtnCreateGraph";

const { Sider: AntSider } = Layout;

const PREFIX_GRAPH_KEY = "G_BASE";
const PREFIX_GRAPH_MAIN_MOD_KEY = "G_MAIN";
const PREFIX_GRAPH_SUB_MOD_KEY = "G_MOD";

const mkGraphKey = (key: string) => `${PREFIX_GRAPH_KEY}__${key}`;

const mkGraphMainModKey = (key: string) =>
    `${PREFIX_GRAPH_MAIN_MOD_KEY}__${key}`;

const mkGraphSubModKey = (mainKey: string, moduleKey: string) =>
    `${PREFIX_GRAPH_SUB_MOD_KEY}__${mainKey}__${moduleKey}`;

export const Sider: React.FC<{
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}> = ({ collapsed, setCollapsed }) => {
    const [graphStorage] = useAtom(graphStorageAtom);
    const [editorState] = useAtom(editorStateAtom);

    const items: MenuProps["items"] = Object.values(graphStorage)
        // Newest go first
        .sort((a, b) => b.created - a.created)
        .map((mainItem) => ({
            key: mkGraphKey(mainItem.graphId),
            icon: <ItemIcon path={[mainItem.graphId]} />,
            label: mainItem.name.trim().length ? mainItem.name.trim() : "Chain",
            children: [
                // main module
                {
                    key: mkGraphMainModKey(mainItem.graphId),
                    icon: <ItemIcon path={[mainItem.graphId]} />,
                    label: "Main",
                },
                // actual modules as rest of entries
                ...Object.values(mainItem.modules).map((module) => ({
                    key: mkGraphSubModKey(mainItem.graphId, module.graphId),
                    icon: (
                        <ItemIcon path={[mainItem.graphId, module.graphId]} />
                    ),
                    label: module.name.trim().length
                        ? module.name.trim()
                        : "Module",
                })),
            ],
        }));

    const selectedParentKey =
        editorState.path.length >= 1 ? mkGraphKey(editorState.path[0]) : null;

    const selectedModuleKey =
        editorState.path.length === 1
            ? mkGraphMainModKey(editorState.path[0])
            : editorState.path.length === 2
            ? mkGraphSubModKey(editorState.path[0], editorState.path[1])
            : null;

    const selectedKeys = selectedModuleKey ? [selectedModuleKey] : [];

    const [openKeys, setOpenKeys] = useState([] as string[]);

    // Ensure selection is open
    useEffect(() => {
        if (selectedParentKey && !openKeys.includes(selectedParentKey)) {
            setOpenKeys((old) => [...old, selectedParentKey]);
        }
    }, [openKeys, selectedParentKey]);

    const handleModuleClick: MenuProps["onClick"] = ({ keyPath }) => {
        const [moduleKey] = keyPath;
        // main module
        if (moduleKey.startsWith(PREFIX_GRAPH_MAIN_MOD_KEY)) {
            openPath([moduleKey.split("__")[1]]);
        }
        // sub module
        else if (moduleKey.startsWith(PREFIX_GRAPH_SUB_MOD_KEY)) {
            const [, graphId, moduleId] = moduleKey.split("__");
            openPath([graphId, moduleId]);
        }
    };

    return (
        <AntSider
            style={{ overflowY: "auto", overflowX: "hidden" }}
            collapsed={collapsed}
            onBreakpoint={(broken) => setCollapsed(broken)}
            collapsible
            breakpoint="sm"
            trigger={null}
            collapsedWidth={0}
            width={300}
        >
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "stretch",
                    alignItems: "center",
                    padding: "5px 5px",
                }}
            >
                <BtnCreateGraph />
            </div>
            {!collapsed ? (
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={selectedKeys}
                    openKeys={openKeys}
                    items={items}
                    onOpenChange={setOpenKeys}
                    onClick={handleModuleClick}
                />
            ) : null}
        </AntSider>
    );
};
