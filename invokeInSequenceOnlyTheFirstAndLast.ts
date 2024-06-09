export function invokeInSequenceOnlyTheFirstAndLast<F extends ((...args: any[]) => Promise<void>)>(
    fun: F,
): (...args: Parameters<F>) => Promise<void> {
    let waiter: Waiter | null = null;
    let currentExecution: Promise<void> | null = null;
    let lastParams: Parameters<F> | null = null;

    return async function ret(...args: Parameters<F>): Promise<void> {
        if (currentExecution !== null) {
            lastParams = args;
            if (waiter !== null) {
                waiter.resolve()
            }
            waiter = new Waiter();
            return waiter.unwrap();
        }
        currentExecution = fun(...args);
        await currentExecution;
        currentExecution = null;
        if (waiter !== null) {
            const pevWaiter = waiter;
            waiter = null;
            ret(...lastParams!).then(() => {
                pevWaiter.resolve();
            });
        }
    };
}

export class Waiter {
    private resolver: () => void;
    private readonly promise: Promise<void>;

    constructor() {
        this.resolver = () => {};
        this.promise = new Promise<void>((resolve) => {
            this.resolver = resolve;
        });
    }

    public resolve() {
        this.resolver();
    }

    public unwrap() {
        return this.promise;
    }
}
