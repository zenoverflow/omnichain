import styled from "styled-components";
import { ClassicScheme, Presets } from "rete-react-plugin";
const { useConnection } = Presets.classic;

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
    pathColor: string;
};

const Path = styled.path<PathProps>`
    fill: none;
    stroke-width: 5px;
    stroke: ${(props) => props.pathColor};
    pointer-events: auto;
    ${(props) => props.styles && props.styles(props)}
`;

type ConnectionProps = {
    data: ClassicScheme["Connection"] & { isLoop?: boolean };
    styles?: () => any;
};

export const makeColoredConnection = (pathColor: string = "#52c41a") => {
    const CustomConnection = (props: ConnectionProps) => {
        const { path } = useConnection();

        if (!path) return null;

        return (
            <Svg data-testid="connection">
                <Path
                    //
                    styles={props.styles}
                    pathColor={pathColor}
                    d={path}
                />
            </Svg>
        );
    };
    return CustomConnection;
};
