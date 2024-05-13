import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { ReactArea2D } from "rete-react-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";

export type CNodeEditor = NodeEditor<any>;

export type AreaExtra = ReactArea2D<any> | ContextMenuExtra;

export type CAreaPlugin = AreaPlugin<any, AreaExtra>;
