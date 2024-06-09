import assert from "node:assert";
import { describe, test } from "node:test";

import { invokeInSequenceOnlyTheFirstAndLast, Waiter } from "./invokeInSequenceOnlyTheFirstAndLast";

describe("invokeInSequenceOnlyTheFirstAndLast", () => {
    function createFunWithOuterResolver() {
        const invokes: string[] = [];
        const waiters: Waiter[] = [];
        async function fun(result: number): Promise<void> {

            const waiter = new Waiter();
            invokes.push(`s-${result}`);
            waiters.push(waiter);
            await waiter.unwrap();
            invokes.push(`f-${result}`);
        }
        return { fun, invokes, waiters };
    }

    test("Invoke wrapped function once. Base function should be invoked.", async () => {
        const { fun, invokes, waiters } = createFunWithOuterResolver();
        const res = invokeInSequenceOnlyTheFirstAndLast(fun)(1);
        await Promise.resolve();
        waiters[0].resolve();
        await res;
        assert.deepEqual(invokes, ["s-1", "f-1"]);
    });

    test(`Invoke the wrapper several times. Each invocation should occur only after 
         the previous execution completes. The base function should be invoked 
         the same number of times in the same sequence.`, async () => {
        const { fun, invokes, waiters } = createFunWithOuterResolver();
        const wrappedFun = invokeInSequenceOnlyTheFirstAndLast(fun);
        const res1 = wrappedFun(1);
        await Promise.resolve();
        waiters[0].resolve();
        await res1;
        const res2 = wrappedFun(2);
        await Promise.resolve();
        waiters[1].resolve();
        await res2;
        const res3 = wrappedFun(3);
        await Promise.resolve();
        waiters[2].resolve();
        await res3;
        assert.deepEqual(invokes, ["s-1", "f-1", "s-2", "f-2", "s-3", "f-3"]);
    });

    test(`Invoke the wrapper 4 times. The second and third invocations occur before 
         the first execution is finished. The fourth invocation occurs after the first execution is finished
         and before the third execution is finished. The base function should be invoked in sequence:
         with the first argument, then the third, and finally the fourth.`, async () => {
        const { fun, invokes, waiters } = createFunWithOuterResolver();
        const wrappedFun = invokeInSequenceOnlyTheFirstAndLast(fun);
        const res1 = wrappedFun(1);
        const res2 = wrappedFun(2);
        const res3 = wrappedFun(3);
        assert.deepEqual(invokes, ["s-1"]);
        waiters[0].resolve();
        await Promise.all([res1, res2]);
        assert.deepEqual(invokes, ["s-1", "f-1", "s-3"]);
        const res4 = wrappedFun(4);
        waiters[1].resolve();
        await res3;
        assert.deepEqual(invokes, ["s-1", "f-1", "s-3", "f-3", "s-4"]);
        waiters[2].resolve();
        await res4;
        assert.deepEqual(invokes, ["s-1", "f-1", "s-3", "f-3", "s-4", "f-4"]);
    });
});
