import React, { useMemo } from "react";

import styled, { css } from "styled-components";

import { ClassicScheme, RenderEmit, Presets } from "rete-react-plugin";

import { NodeContextObj } from "../../nodes/context";
import { ModuleNode } from "../../nodes";
import { getMenuIcon } from "../../nodes/icons";

const $nodewidth = 200;
const $socketmargin = 6;
const $socketsize = 25;

const { RefSocket, RefControl } = Presets.classic;

export const StyledSocket = styled.div`
    display: inline-block;
    cursor: pointer;
    width: ${$socketsize}px;
    height: ${$socketsize}px;
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
    border: 3px solid #91caff;
    border-radius: 10px;
    width: ${(props) =>
        Number.isFinite(props.width) ? `${props.width}px` : `${$nodewidth}px`};
    height: ${(props) =>
        Number.isFinite(props.height) ? `${props.height}px` : "auto"};
    position: relative;
    user-select: none;
    ${(props) =>
        props.selected &&
        css`
            border-color: #ffc53d;
        `}
    ${(props) =>
        props.disabled &&
        css`
            pointer-events: none;
        `}
    .title {
        color: white;
        font-family: sans-serif;
        font-size: 18px;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
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
        margin: ${$socketmargin}px;
        line-height: ${$socketsize}px;
    }
    .input-control {
        z-index: 1;
        width: calc(100% - ${$socketsize + 2 * $socketmargin}px);
        vertical-align: middle;
        display: inline-block;
    }
    .control {
        display: block;
        height: auto;
        padding: ${$socketmargin}px ${$socketsize / 2 + $socketmargin}px;
    }
    ${(props) => props.styles && props.styles(props)}
`;

function sortByIndex<T extends [string, undefined | { index?: number }][]>(
    entries: T
) {
    entries.sort((a, b) => {
        const ai = a[1]?.index || 0;
        const bi = b[1]?.index || 0;

        return ai - bi;
    });
}

type Props<S extends ClassicScheme> = {
    data: S["Node"] & NodeExtraData;
    styles?: () => any;
    emit: RenderEmit<S>;
};

const ExecutionIndicator: React.FC<{ node: any }> = (props) => {
    const { pathToGraph }: NodeContextObj = props.node.context;
    const nodeId: string = props.node.id;

    return (
        <div
            data-exec-graph={pathToGraph[0]}
            data-exec-module={pathToGraph[1]}
            data-exec-node={nodeId}
            data-exec-is-module-node={
                props.node instanceof ModuleNode ? "1" : "0"
            }
            data-exec-is-module-node-val={
                props.node instanceof ModuleNode
                    ? (props.node.controls.module?.value ?? [])[1] || ""
                    : ""
            }
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
                // boxShadow: "0 0 30px #ffe58f",
                animation: "glow 1.2s ease-in infinite",
            }}
        ></div>
    );
};

export function CustomNode<Scheme extends ClassicScheme>(props: Props<Scheme>) {
    const inputs = Object.entries(props.data.inputs);
    const outputs = Object.entries(props.data.outputs);
    const controls = Object.entries(props.data.controls);
    const selected = props.data.selected || false;

    const readOnly = (props.data as any).context.getIsActive() === true;

    sortByIndex(inputs);
    sortByIndex(outputs);
    sortByIndex(controls);

    const { id, label, width: _w, height: _h } = props.data;

    const cleanLabel = useMemo(() => {
        return label.replace("Node", "").trim();
    }, [label]);

    const icon = useMemo(() => {
        return getMenuIcon(label);
    }, [label]);

    return (
        <StyledWrapper
            data-context-menu={`${id}`}
            selected={selected}
            width={_w}
            height={_h}
            styles={props.styles}
            disabled={readOnly}
        >
            <ExecutionIndicator node={props.data} />
            <div className="title" data-testid="title">
                {icon}
                <span style={{ paddingLeft: "5px" }}>{cleanLabel}</span>
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
                                {output?.label}
                            </div>
                            <RefSocket
                                name="output-socket"
                                side="output"
                                emit={props.emit}
                                socketKey={key}
                                nodeId={id}
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
                                nodeId={id}
                                payload={input.socket}
                                data-testid="input-socket"
                            />
                            {input &&
                                (!input.control || !input.showControl) && (
                                    <div
                                        className="input-title"
                                        data-testid="input-title"
                                    >
                                        {input?.label}
                                    </div>
                                )}
                            {input?.control && input?.showControl && (
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
