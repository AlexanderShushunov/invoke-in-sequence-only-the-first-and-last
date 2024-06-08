import assert from "assert/strict";
import { beforeEach, describe, it } from "node:test";

import { invokeInSequenceOnlyTheFirstAndLast } from "./invokeInSequenceOnlyTheFirstAndLast";

describe("invokeInSequenceOnlyTheFirstAndLast", () => {
    const result: number[] = [];
    async function base() {
        result.push(1);
        return;
    }

    beforeEach(() => {
        result.length = 0;
    });

    it("should invoke base function", async () => {
        const wrapped = invokeInSequenceOnlyTheFirstAndLast(base)
        await wrapped();
        assert.deepEqual(result, [1]);
    });
});
