import { useMemo } from "react";
import { useAtom } from "jotai";
import { PlayCircleOutlined, PartitionOutlined } from "@ant-design/icons";

import { executorAtom } from "../../state/executor";

export const ItemIcon: React.FC<{ graphId: string }> = (props) => {
    const [executor] = useAtom(executorAtom);

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

    // if (props.graphId.length === 1) {
    // }
    // if (props.graphId.length === 2) {
    //     return <DatabaseOutlined />;
    // }
    // return <BorderOutlined />;
};
