import { useMemo } from "react";
import { PlayCircleOutlined, PartitionOutlined } from "@ant-design/icons";

import { executorStorage } from "../../state/executor";
import { useOuterState } from "../../util/ObservableUtilsReact";

export const ItemIcon: React.FC<{ graphId: string }> = (props) => {
    const [executor] = useOuterState(executorStorage);

    const isBeingExecuted = useMemo(() => {
        for (const execInst of Object.values(executor)) {
            return execInst.graphId === props.graphId;
        }
        return false;
    }, [executor, props.graphId]);

    if (isBeingExecuted) {
        return <PlayCircleOutlined />;
    }

    return <PartitionOutlined />;
};
