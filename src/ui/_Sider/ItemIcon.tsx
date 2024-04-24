import { useMemo } from "react";
import { PlayCircleOutlined, PartitionOutlined } from "@ant-design/icons";

import { executorStorage } from "../../state/executor";
import { useOuterState } from "../../util/ObservableUtilsReact";

export const ItemIcon: React.FC<{ graphId: string }> = (props) => {
    const [executorInstance] = useOuterState(executorStorage);

    const isBeingExecuted = useMemo(
        () => executorInstance?.graphId === props.graphId,
        [executorInstance, props.graphId]
    );

    if (isBeingExecuted) {
        return <PlayCircleOutlined />;
    }

    return <PartitionOutlined />;
};
