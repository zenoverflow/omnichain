import type { ControlUpdate } from "../nodes/context";

import { SimpleObservable } from "../util/ObservableUtils";

export const controlObservable = new SimpleObservable<ControlUpdate>();

export const controlDisabledObservable = new SimpleObservable<
    [string, boolean]
>();

export const complexErrorObservable = new SimpleObservable<[string, string]>();
