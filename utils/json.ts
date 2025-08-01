export function safeJSONStringify(value: any, space: number = 2): string {
  const seen = new WeakSet();

  return JSON.stringify(
    value,
    (key, val) => {
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) {
          return "[Circular]";
        }
        seen.add(val);
      }
      return val;
    },
    space
  );
}
