import { useMemo } from "react";
import { PlayCircleOutlined, PartitionOutlined } from "@ant-design/icons";

import { executorStorage } from "../../state/executor";
import { useOuterState } from "../../util/ObservableUtilsReact";

export const ItemIcon: React.FC<{ graphId: string }> = (props) => {
    const [executorGraph] = useOuterState(executorStorage);

    const isBeingExecuted = useMemo(
        () => executorGraph?.graph.graphId === props.graphId,
        [executorGraph, props.graphId]
    );

    if (isBeingExecuted) {
        return <PlayCircleOutlined />;
    }

    return <PartitionOutlined />;
};
