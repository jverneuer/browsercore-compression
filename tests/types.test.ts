/**
 * Tests for the runtime pieces of the @browsercore/compression domain types.
 *
 * `src/types.ts` is mostly the `CompressionProvider` interface and the
 * `ContentEncoding` literal union (verified at compile time). The one runtime
 * surface is `SUPPORTED_ENCODINGS` — the array of content-encoding tokens the
 * package knows how to decode, used for exhaustiveness and runtime checks.
 */

import { describe, expect, it } from "vitest";

import { SUPPORTED_ENCODINGS, type ContentEncoding } from "../src/types.js";

describe("SUPPORTED_ENCODINGS", () => {
    it("lists every content-encoding token the package decodes", () => {
        expect([...SUPPORTED_ENCODINGS]).toEqual(["gzip", "deflate", "br", "identity"]);
    });

    it("contains identity for exhaustiveness (no-op decoding)", () => {
        expect(SUPPORTED_ENCODINGS).toContain("identity");
    });

    it("each entry satisfies the ContentEncoding union", () => {
        const encodings: ContentEncoding[] = [...SUPPORTED_ENCODINGS];
        expect(encodings).toHaveLength(4);
    });
});
