import {
    FileTextOutlined,
    PlayCircleOutlined,
    CodeOutlined,
    RedoOutlined,
    BuildOutlined,
    BorderOutlined,
    ImportOutlined,
    ExportOutlined,
    HourglassOutlined,
    DeleteOutlined,
    CopyOutlined,
    GroupOutlined,
    NumberOutlined,
} from "@ant-design/icons";

import {
    LogOutputNode,
    TriggerIntervalNode,
    ModuleNode,
    ModuleInputNode,
    ModuleOutputNode,
    DelayOutputNode,
    AutoTextSlicerNode,
    TextNode,
    TriggerOnceNode,
    HashVectorizerNode,
} from ".";

const ICONS: Record<string, any> = {
    [TriggerOnceNode.name]: PlayCircleOutlined,
    [TriggerIntervalNode.name]: RedoOutlined,
    [LogOutputNode.name]: CodeOutlined,
    [ModuleNode.name]: BuildOutlined,
    [ModuleInputNode.name]: ImportOutlined,
    [ModuleOutputNode.name]: ExportOutlined,
    [DelayOutputNode.name]: HourglassOutlined,
    [TextNode.name]: FileTextOutlined,
    [AutoTextSlicerNode.name]: GroupOutlined,
    [HashVectorizerNode.name]: NumberOutlined,

    ["Duplicate"]: CopyOutlined,
    ["Delete"]: DeleteOutlined,

    ["Triggers"]: PlayCircleOutlined,
    ["Content"]: FileTextOutlined,
    ["Modules"]: BuildOutlined,
};

export const getMenuIcon = (itemName: string) => {
    const Icon = ICONS[itemName] || ICONS[`${itemName}Node`] || BorderOutlined;
    return <Icon />;
};
