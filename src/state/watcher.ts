import { SimpleObservable } from "../util/ObservableUtils";
import type { ControlUpdate } from "../nodes/context";

export const controlObservable = new SimpleObservable<ControlUpdate>();
