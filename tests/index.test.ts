/**
 * Tests for the @browsercore/compression barrel (src/index.ts).
 *
 * The barrel re-exports the provider/encoding types, the supported-encodings
 * array, the typed error classes, and `assertNever`. This test exercises the
 * barrel so the re-export surface is covered and confirms the public API
 * resolves to the expected concrete values.
 */

import { describe, expect, it } from "vitest";

import {
    CompressionError,
    DecompressionError,
    SUPPORTED_ENCODINGS,
    UnsupportedEncodingError,
    assertNever,
    ensureCompressionError,
} from "../src/index.js";

describe("barrel re-exports resolve", () => {
    it("re-exports the supported-encodings array", () => {
        expect(SUPPORTED_ENCODINGS).toEqual(["gzip", "deflate", "br", "identity"]);
    });

    it("re-exports the typed error classes", () => {
        expect(CompressionError).toBeInstanceOf(Function);
        expect(UnsupportedEncodingError).toBeInstanceOf(Function);
        expect(DecompressionError).toBeInstanceOf(Function);
        expect(ensureCompressionError).toBeInstanceOf(Function);
    });

    it("re-exports the assertNever helper", () => {
        expect(assertNever).toBeInstanceOf(Function);
    });
});
