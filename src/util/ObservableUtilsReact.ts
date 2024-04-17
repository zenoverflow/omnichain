import { useState, useEffect } from "react";

import { StatefulObservable } from "./ObservableUtils";

export const useOuterState = <T>(
    s: StatefulObservable<T>
): [T, (data: T) => void] => {
    const [state, setState] = useState(s.get());

    useEffect(() => {
        const unsub = s.subscribe((data) => {
            setState(data);
        });

        return () => {
            unsub();
        };
    }, [s]);

    return [
        state,
        (data: T) => {
            s.set(data);
        },
    ];
};
