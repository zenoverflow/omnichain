import { ClassicPreset as Classic, GetSchemes, NodeEditor } from "rete";

import { Area2D, AreaExtensions, AreaPlugin } from "rete-area-plugin";

import {
    ReactPlugin,
    ReactArea2D,
    Presets as ReactPresets,
} from "rete-react-plugin";
import { createRoot } from "react-dom/client";

import { DataflowEngine, DataflowNode } from "rete-engine";
import {
    AutoArrangePlugin,
    Presets as ArrangePresets,
} from "rete-auto-arrange-plugin";
import { ReadonlyPlugin } from "rete-readonly-plugin";
import {
    ContextMenuPlugin,
    ContextMenuExtra,
    Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import { MinimapExtra, MinimapPlugin } from "rete-minimap-plugin";
import {
    ReroutePlugin,
    RerouteExtra,
    RerouteExtensions,
} from "rete-connection-reroute-plugin";
import {
    ConnectionPlugin,
    Presets as ConnectionPresets
  } from "rete-connection-plugin";

type Node = NumberNode | AddNode;
type Conn =
    | Connection<NumberNode, AddNode>
    | Connection<AddNode, AddNode>
    | Connection<AddNode, NumberNode>;
type Schemes = GetSchemes<Node, Conn>;

class Connection<A extends Node, B extends Node> extends Classic.Connection<
    A,
    B
> {}

class NumberNode extends Classic.Node implements DataflowNode {
    width = 180;
    height = 120;

    constructor(initial: number, change?: (value: number) => void) {
        super("Number");

        this.addOutput("value", new Classic.Output(socket, "Number"));
        this.addControl(
            "value",
            new Classic.InputControl("number", { initial, change })
        );
    }
    data() {
        const value = (this.controls["value"] as Classic.InputControl<"number">)
            .value;

        return {
            value,
        };
    }
}

class AddNode extends Classic.Node implements DataflowNode {
    width = 180;
    height = 195;

    constructor() {
        super("Add");

        this.addInput("a", new Classic.Input(socket, "A"));
        this.addInput("b", new Classic.Input(socket, "B"));
        this.addOutput("value", new Classic.Output(socket, "Number"));
        this.addControl(
            "result",
            new Classic.InputControl("number", { initial: 0, readonly: true })
        );
    }
    data(inputs: { a?: number[]; b?: number[] }) {
        const { a = [], b = [] } = inputs;
        const sum = (a[0] || 0) + (b[0] || 0);

        (this.controls["result"] as Classic.InputControl<"number">).setValue(
            sum
        );

        return {
            value: sum,
        };
    }
}

type AreaExtra =
    | Area2D<Schemes>
    | ReactArea2D<Schemes>
    | ContextMenuExtra
    | MinimapExtra
    | RerouteExtra;

const socket = new Classic.Socket("socket");

export async function createEditor(container: HTMLElement) {
    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);

    const reactRender = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

    const readonly = new ReadonlyPlugin<Schemes>();
    const contextMenu = new ContextMenuPlugin<Schemes>({
        items: ContextMenuPresets.classic.setup([
            ["Number", () => new NumberNode(1, process)],
            ["Add", () => new AddNode()],
        ]),
    });
    // const minimap = new MinimapPlugin<Schemes>();
    const reroutePlugin = new ReroutePlugin<Schemes>();

    // editor.use(readonly.root);
    editor.use(area);
    // area.use(readonly.area);
    area.use(reactRender);

    area.use(contextMenu);
    // area.use(minimap);
    reactRender.use(reroutePlugin);

    reactRender.addPreset(ReactPresets.classic.setup());
    reactRender.addPreset(ReactPresets.contextMenu.setup());
    reactRender.addPreset(ReactPresets.minimap.setup());
    reactRender.addPreset(
        ReactPresets.reroute.setup({
            contextMenu(id) {
                reroutePlugin.remove(id);
            },
            translate(id, dx, dy) {
                reroutePlugin.translate(id, dx, dy);
            },
            pointerdown(id) {
                reroutePlugin.unselect(id);
                reroutePlugin.select(id);
            },
        })
    );

    const dataflow = new DataflowEngine<Schemes>();

    editor.use(dataflow);

    const a = new NumberNode(1, process);
    const b = new NumberNode(1, process);
    const add = new AddNode();

    await editor.addNode(a);
    await editor.addNode(b);
    await editor.addNode(add);

    await editor.addConnection(new Connection(a, "value", add, "a"));
    await editor.addConnection(new Connection(b, "value", add, "b"));

    const arrange = new AutoArrangePlugin<Schemes>();

    arrange.addPreset(ArrangePresets.classic.setup());

    area.use(arrange);

    await arrange.layout();

    AreaExtensions.zoomAt(area, editor.getNodes());

    AreaExtensions.simpleNodesOrder(area);

    const selector = AreaExtensions.selector();
    const accumulating = AreaExtensions.accumulateOnCtrl();

    AreaExtensions.selectableNodes(area, selector, { accumulating });
    RerouteExtensions.selectablePins(reroutePlugin, selector, accumulating);

    async function process() {
        dataflow.reset();

        editor
            .getNodes()
            .filter((node) => node instanceof AddNode)
            .forEach(async (node) => {
                const sum = await dataflow.fetch(node.id);

                console.log(node.id, "produces", sum);

                area.update(
                    "control",
                    (node.controls["result"] as Classic.InputControl<"number">)
                        .id
                );
            });
    }

    editor.addPipe((context) => {
        if (
            context.type === "connectioncreated" ||
            context.type === "connectionremoved"
        ) {
            process();
        }
        return context;
    });

    process();

    readonly.enable();

    return {
        destroy: () => area.destroy(),
    };
}
