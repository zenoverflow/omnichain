import {
    FileTextOutlined,
    PlayCircleOutlined,
    CodeOutlined,
    BuildOutlined,
    BorderOutlined,
    ImportOutlined,
    ExportOutlined,
    HourglassOutlined,
    DeleteOutlined,
    CopyOutlined,
    GroupOutlined,
} from "@ant-design/icons";

import {
    LogOutputNode,
    ModuleNode,
    ModuleInputNode,
    ModuleOutputNode,
    DelayOutputNode,
    AutoTextSlicerNode,
    TextNode,
    EntrypointNode,
} from ".";

const ICONS: Record<string, any> = {
    [EntrypointNode.name]: PlayCircleOutlined,
    [LogOutputNode.name]: CodeOutlined,
    [ModuleNode.name]: BuildOutlined,
    [ModuleInputNode.name]: ImportOutlined,
    [ModuleOutputNode.name]: ExportOutlined,
    [DelayOutputNode.name]: HourglassOutlined,
    [TextNode.name]: FileTextOutlined,
    [AutoTextSlicerNode.name]: GroupOutlined,

    ["Duplicate"]: CopyOutlined,
    ["Delete"]: DeleteOutlined,

    ["Basic"]: PlayCircleOutlined,
    ["Content"]: FileTextOutlined,
    ["Modules"]: BuildOutlined,
};

export const getMenuIcon = (itemName: string) => {
    const Icon = ICONS[itemName] || ICONS[`${itemName}Node`] || BorderOutlined;
    return <Icon />;
};
