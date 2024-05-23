import styled from "styled-components";
import { ClassicScheme, Presets } from "rete-react-plugin";
const { useConnection } = Presets.classic;

import { editorStateStorage } from "../../state/editor";
import { executorStorage } from "../../state/executor";

const Svg = styled.svg`
    overflow: visible !important;
    position: absolute;
    z-index: -3;
    pointer-events: none;
    width: 9999px;
    height: 9999px;
`;

type PathProps = {
    styles?: (props: any) => any;
    stroke: string;
};

export const Path = styled.path<PathProps>`
    fill: none;
    stroke-width: 8px;
    stroke: ${(props) => props.stroke};
    pointer-events: auto;
    ${
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (props) => props.styles && props.styles(props)
    }
`;

type ConnectionProps = {
    data: ClassicScheme["Connection"] & { isLoop?: boolean };
    styles?: () => any;
};

// eslint-disable-next-line react-refresh/only-export-components
export const makeColoredConnection = (stroke = "#f0f5ff") => {
    const createSvgPath = (
        start: { x: number; y: number },
        end: { x: number; y: number }
    ) => {
        // If end is to the right, draw a slight cubic bezier curve
        if (end.x > start.x) {
            // return `M${start.x},${start.y}L${end.x},${end.y}`;
            const c1 = {
                x: start.x + 12,
                y: start.y,
            };
            const c2 = {
                x: end.x - 12,
                y: end.y,
            };
            return `M${start.x},${start.y}C${c1.x},${c1.y},${c2.x},${c2.y},${end.x},${end.y}`;
        }

        // Otherwise, follow a turn algo

        // standard deviation
        const sd = 70;

        // First, make a point at x+100,y
        const p1 = {
            x: start.x + sd,
            y: start.y,
        };

        // Next, make a point at p1.x,p1.y-120
        const p2 = {
            x: p1.x,
            y: p1.y - 120,
        };

        // Next, make a point at end.x-sd,p2.y
        const p3 = {
            x: end.x - sd,
            y: p2.y,
        };

        // Next, make a point at p3.x,end.y
        const p4 = {
            x: p3.x,
            y: end.y,
        };

        // Finally, draw the path
        return [
            `M${start.x},${start.y}`,
            `L${p1.x},${p1.y}`,
            `L${p2.x},${p2.y}`,
            `L${p3.x},${p3.y}`,
            `L${p4.x},${p4.y}`,
            `L${end.x},${end.y}`,
        ].join("");
    };

    const CustomConnection = (props: ConnectionProps) => {
        const { path, start, end } = useConnection();

        // Remove connection on middle-click
        const handleClick = (e: any) => {
            e.preventDefault();
            if (e.button === 1) {
                // Editing disabled during execution
                const executorState = executorStorage.get();
                if (executorState) return;

                const editorState = editorStateStorage.get();
                if (!editorState) return;

                void editorState.editor.removeConnection(props.data.id);
            }
        };

        if (!path || !start || !end) return null;

        return (
            <Svg data-testid="connection" onMouseUp={handleClick}>
                <Path
                    //
                    styles={props.styles}
                    stroke={stroke}
                    d={createSvgPath(start, end)}
                />
            </Svg>
        );
    };
    return CustomConnection;
};
