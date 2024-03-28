import { useAtom } from "jotai";
import { useMemo } from "react";

import {
    PlayCircleOutlined,
    PartitionOutlined,
    DatabaseOutlined,
    BorderOutlined,
} from "@ant-design/icons";

import { executorAtom } from "../../state/executor";

export const ItemIcon: React.FC<{ path: string[] }> = (props) => {
    const [executor] = useAtom(executorAtom);

    const isBeingExecuted = useMemo(() => {
        for (const execInst of Object.values(executor)) {
            if (props.path.length === 1) {
                return execInst.graphId === props.path[0];
            }
            //
            else if (props.path.length === 2 && !!execInst.step) {
                const execParts = execInst.step.split("__");
                if (execParts.length === 3) {
                    return (
                        execInst.graphId === props.path[0] &&
                        execParts[1] === props.path[1]
                    );
                }
            }
        }
        return false;
    }, [executor, props.path]);

    if (isBeingExecuted) {
        return <PlayCircleOutlined />;
    }

    if (props.path.length === 1) {
        return <PartitionOutlined />;
    }

    if (props.path.length === 2) {
        return <DatabaseOutlined />;
    }

    return <BorderOutlined />;
};
