import { useState, useEffect } from "react";

import { StatefulObservable } from "./ObservableUtils";

export const useOuterState = <T>(s: StatefulObservable<T>) => {
    const [state, setState] = useState(s.get());

    useEffect(() => {
        const unsub = s.subscribe((data) => {
            setState(data);
        });

        return () => {
            unsub();
        };
    }, [s]);

    return [state, s.set];
};
