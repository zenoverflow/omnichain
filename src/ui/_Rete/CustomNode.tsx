import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { ClassicScheme, RenderEmit, Presets } from "rete-react-plugin";

import { getMenuIcon } from "./NodeIcons";
import { BtnDoc } from "./BtnDoc";

const SOCKET_MARGIN = 6;
const SOCKET_SIZE = 25;

const { RefSocket, RefControl } = Presets.classic;

export const StyledSocket = styled.div`
    display: inline-block;
    cursor: pointer;
    width: ${SOCKET_SIZE}px;
    height: ${SOCKET_SIZE}px;
    border-radius: 25px;
    margin: 0;
    vertical-align: middle;
    background: #fff;
    z-index: 2;
    box-sizing: border-box;
    &:hover {
        background: #ffc53d;
    }
`;

type NodeExtraData = {
    width?: number;
    height?: number;
};

type WrapperProps = {
    selected?: boolean;
    disabled?: boolean;
    styles?: (props: any) => any;
};

const StyledWrapper = styled.div<NodeExtraData & WrapperProps>`
    background-color: #1677ff;
    cursor: pointer;
    box-sizing: border-box;
    padding-bottom: 6px;
    border: 6px solid #1677ff;
    border-radius: 10px;
    width: ${(props) =>
        Number.isFinite(props.width) && props.width
            ? `${props.width.toString()}px`
            : "200px"};
    height: ${(props) =>
        Number.isFinite(props.height) && props.height
            ? `${props.height.toString()}px`
            : "auto"};
    position: relative;
    user-select: none;
    ${(props) =>
        props.selected &&
        css`
            border-color: #fff1b8;
        `}
    .title {
        color: white;
        font-family: sans-serif;
        font-size: 18px;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .output {
        text-align: right;
    }
    .input {
        text-align: left;
    }
    .output-socket {
        text-align: right;
        margin-right: -14px;
        display: inline-block;
    }
    .input-socket {
        text-align: left;
        margin-left: -14px;
        display: inline-block;
    }
    .input-title,
    .output-title {
        vertical-align: middle;
        color: white;
        display: inline-block;
        font-family: sans-serif;
        font-size: 14px;
        margin: ${SOCKET_MARGIN}px;
        line-height: ${SOCKET_SIZE}px;
    }
    .input-control {
        z-index: 1;
        width: calc(100% - ${SOCKET_SIZE + 2 * SOCKET_MARGIN}px);
        vertical-align: middle;
        display: inline-block;
    }
    .control {
        display: block;
        height: auto;
        padding: ${SOCKET_MARGIN}px ${SOCKET_SIZE / 2 + SOCKET_MARGIN}px;
    }
    ${
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (props) => props.styles && props.styles(props)
    }
`;

function sortByIndex<T extends [string, undefined | { index?: number }][]>(
    entries: T
) {
    const sorted = [...entries];
    sorted.sort((a, b) => {
        const ai = a[1]?.index || 0;
        const bi = b[1]?.index || 0;

        return ai - bi;
    });
    return sorted;
}

type Props<S extends ClassicScheme> = {
    data: S["Node"] & NodeExtraData;
    styles?: () => any;
    emit: RenderEmit<S>;
};

const ExecutionIndicator: React.FC<{ node: any }> = (props) => {
    return (
        <div
            data-exec-graph={props.node.graphId}
            data-exec-node={props.node.id}
            style={{
                display: "none",
                position: "absolute",
                top: -1,
                left: -1,
                right: -1,
                bottom: -1,
                zIndex: -1,
                borderRadius: "10px",
                pointerEvents: "none",
                boxSizing: "border-box",
                animation: "glow 1.2s ease-in infinite",
            }}
        ></div>
    );
};

export function CustomNode<Scheme extends ClassicScheme>(props: Props<Scheme>) {
    const inputs = useMemo(
        () => sortByIndex(Object.entries(props.data.inputs)),
        [props.data.inputs]
    );

    const outputs = useMemo(
        () => sortByIndex(Object.entries(props.data.outputs)),
        [props.data.outputs]
    );

    const controls = useMemo(
        () => sortByIndex(Object.entries(props.data.controls)),
        [props.data.controls]
    );

    const cleanLabel = useMemo(() => {
        return props.data.label.replace(/Node$/, "").trim();
    }, [props.data.label]);

    const icon = useMemo(() => {
        return getMenuIcon(props.data.label);
    }, [props.data.label]);

    return (
        <StyledWrapper
            data-context-menu={props.data.id}
            selected={props.data.selected || false}
            width={props.data.width}
            height={props.data.height}
            styles={props.styles}
        >
            <ExecutionIndicator node={props.data} />
            <div className="title" data-testid="title">
                <div>
                    {icon}
                    <span style={{ paddingLeft: "5px" }}>{cleanLabel}</span>
                </div>

                <BtnDoc nodeName={cleanLabel} doc={(props.data as any).doc} />
            </div>
            {/* Outputs */}
            {outputs.map(
                ([key, output]) =>
                    output && (
                        <div
                            className="output"
                            key={key}
                            data-testid={`output-${key}`}
                        >
                            <div
                                className="output-title"
                                data-testid="output-title"
                            >
                                {output.label}
                            </div>
                            <RefSocket
                                name="output-socket"
                                side="output"
                                emit={props.emit}
                                socketKey={key}
                                nodeId={props.data.id}
                                payload={output.socket}
                                data-testid="output-socket"
                            />
                        </div>
                    )
            )}
            {/* Inputs */}
            {inputs.map(
                ([key, input]) =>
                    input && (
                        <div
                            className="input"
                            key={key}
                            data-testid={`input-${key}`}
                        >
                            <RefSocket
                                name="input-socket"
                                emit={props.emit}
                                side="input"
                                socketKey={key}
                                nodeId={props.data.id}
                                payload={input.socket}
                                data-testid="input-socket"
                            />
                            {(!input.control || !input.showControl) && (
                                <div
                                    className="input-title"
                                    data-testid="input-title"
                                >
                                    {input.label}
                                </div>
                            )}
                            {input.control && input.showControl && (
                                <span className="input-control">
                                    <RefControl
                                        key={key}
                                        name="input-control"
                                        emit={props.emit}
                                        payload={input.control}
                                        data-testid="input-control"
                                    />
                                </span>
                            )}
                        </div>
                    )
            )}
            {/* Controls */}
            {controls.map(([key, control]) => {
                return control ? (
                    <RefControl
                        key={key}
                        name="control"
                        emit={props.emit}
                        payload={control}
                        data-testid={`control-${key}`}
                    />
                ) : null;
            })}
        </StyledWrapper>
    );
}
