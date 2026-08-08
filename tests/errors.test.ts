/**
 * Tests for the typed compression error hierarchy.
 *
 * Every failure mode in @browsercore/compression is an explicit error subtype so
 * callers can match on `kind` instead of parsing messages. These tests verify
 * the hierarchy wiring (kind narrowing, name/cause encoding) and the boundary
 * narrowing function `ensureCompressionError`, which guarantees every thrown
 * value is a typed CompressionError.
 */

import { describe, expect, it } from "vitest";

import {
    CompressionError,
    DecompressionError,
    UnsupportedEncodingError,
    ensureCompressionError,
    toError,
} from "../src/errors.js";

describe("CompressionError", () => {
    it("records the message, name and optional cause", () => {
        const cause = new Error("zlib blew up");
        const err = new CompressionError("compress failed", { cause });
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(CompressionError);
        expect(err.name).toBe("CompressionError");
        expect(err.message).toBe("compress failed");
        expect(err.cause).toBe(cause);
    });

    it("tolerates no cause", () => {
        const err = new CompressionError("boom");
        expect(err.cause).toBeUndefined();
    });
});

describe("UnsupportedEncodingError", () => {
    it("narrows kind and records the unsupported encoding", () => {
        const err = new UnsupportedEncodingError("snappy");
        expect(err).toBeInstanceOf(CompressionError);
        expect(err.kind).toBe("UnsupportedEncodingError");
        expect(err.encoding).toBe("snappy");
        expect(err.name).toBe("UnsupportedEncodingError");
        expect(err.message).toContain("snappy");
    });
});

describe("DecompressionError", () => {
    it("narrows kind and records the encoding being decoded", () => {
        const err = new DecompressionError("gzip");
        expect(err).toBeInstanceOf(CompressionError);
        expect(err.kind).toBe("DecompressionError");
        expect(err.encoding).toBe("gzip");
        expect(err.name).toBe("DecompressionError");
    });

    it("preserves an optional cause chain", () => {
        const cause = new Error("truncated stream");
        const err = new DecompressionError("deflate", { cause });
        expect(err.cause).toBe(cause);
    });
});

describe("toError", () => {
    it("passes an Error through unchanged", () => {
        const e = new Error("real error");
        expect(toError(e)).toBe(e);
    });

    it("wraps a string as an Error", () => {
        const err = toError("plain string");
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("plain string");
    });

    it("wraps a non-string non-Error value with a generic message", () => {
        const err = toError(12345);
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("unknown error");
    });
});

describe("ensureCompressionError", () => {
    it("passes an existing CompressionError through unchanged", () => {
        const original = new UnsupportedEncodingError("snappy");
        expect(ensureCompressionError(original, "gzip")).toBe(original);
        expect(ensureCompressionError(original)).toBe(original);
    });

    it("passes a DecompressionError through unchanged", () => {
        const original = new DecompressionError("br");
        expect(ensureCompressionError(original, "gzip")).toBe(original);
    });

    it("wraps a plain Error as a DecompressionError for the encoding", () => {
        const e = new Error("zlib failure");
        const wrapped = ensureCompressionError(e, "gzip");
        expect(wrapped).toBeInstanceOf(DecompressionError);
        expect(wrapped).not.toBe(e);
        expect(wrapped.encoding).toBe("gzip");
        expect(wrapped.cause).toBe(e);
    });

    it("wraps a string thrown value as a DecompressionError", () => {
        const wrapped = ensureCompressionError("bad stream", "deflate");
        expect(wrapped).toBeInstanceOf(DecompressionError);
        expect(wrapped.encoding).toBe("deflate");
        expect(wrapped.cause).toBeInstanceOf(Error);
        expect(wrapped.cause?.message).toBe("bad stream");
    });

    it("wraps a non-string non-Error value via toError", () => {
        const wrapped = ensureCompressionError(true, "br");
        expect(wrapped).toBeInstanceOf(DecompressionError);
        expect(wrapped.encoding).toBe("br");
    });

    it("defaults the encoding to undefined when none is supplied", () => {
        const wrapped = ensureCompressionError(new Error("x"));
        expect(wrapped.encoding).toBeUndefined();
    });
});
