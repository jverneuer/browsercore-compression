/**
 * Tests for the shared helper in @browsercore/compression.
 *
 * `assertNever` is the exhaustiveness guard for the `ContentEncoding`
 * discriminated union — adding a new encoding forces every `switch` handler
 * to compile-error until handled. It is the only piece of runtime logic in
 * the utils module.
 */

import { describe, expect, it } from "vitest";

import { assertNever } from "../src/utils.js";

describe("assertNever", () => {
    it("throws an Error describing the unexpected value", () => {
        expect(() => assertNever("zstd" as never)).toThrow(/Unexpected value/);
    });

    it("includes a JSON representation of the value in the message", () => {
        expect(() => assertNever("snappy" as never)).toThrow(/"snappy"/);
    });
});
