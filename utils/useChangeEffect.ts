import { useEffect, useRef } from "react";

export default function useChangeEffect<D extends unknown[]>(
  func: (deps: D) => void,
  deps: D
) {
  const didMount = useRef(false);
  const previousDeps = usePrevious(deps) || ([] as unknown as D);

  useEffect(() => {
    if (didMount.current) func(previousDeps);
    else didMount.current = true;
  }, deps);
}

export function usePrevious<S>(value: S) {
  const ref = useRef<S>(null);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
