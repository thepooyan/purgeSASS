export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  const result: any = { ...target }

    for (const key in source) {
        if (source[key] === undefined) continue

        if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
        ) {
        result[key] = deepMerge((target as any)[key], source[key] as any)
        } else {
        result[key] = source[key]
        }
    }
    return result as T
}

export function handleOptions<T,P>(defaultOpts: T, action: (props: P, options: T) => void) {
  return (props: P, options?: DeepPartial<T>) => {
    const finalOptions = options ? deepMerge(defaultOpts, options) : defaultOpts;
    action(props, finalOptions);
  };
}