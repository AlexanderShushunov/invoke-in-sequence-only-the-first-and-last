export function invokeInSequenceOnlyTheFirstAndLast<F extends ((...args: any[]) => Promise<void>)>(
    fun: F,
): (...args: Parameters<F>) => Promise<void> {
    return async function (...args: Parameters<F>): Promise<void> {
        return fun(...args);
    };
}
