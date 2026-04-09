export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (x: T) => fns.reduce((acc, fn) => fn(acc), x);
}
