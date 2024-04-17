import styled from "styled-components";
import { ClassicScheme, Presets } from "rete-react-plugin";

const { useConnection } = Presets.classic;

const Svg = styled.svg`
    overflow: visible !important;
    position: absolute;
    pointer-events: none;
    width: 9999px;
    height: 9999px;
`;

const Path = styled.path<{ styles?: (props: any) => any }>`
    fill: none;
    stroke-width: 5px;
    stroke: #ffc53d;
    opacity: 0.5;
    pointer-events: auto;
    ${
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (props) => props.styles && props.styles(props)
    };
`;

export function MagneticConnection(props: {
    data: ClassicScheme["Connection"] & { isLoop?: boolean };
    styles?: () => any;
}) {
    const { path } = useConnection();

    if (!path) return null;

    return (
        <Svg data-testid="connection">
            <Path styles={props.styles} d={path} />
        </Svg>
    );
}
