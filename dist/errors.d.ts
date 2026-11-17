import type { CompressionErrorOptions } from "./types.js";
/**
 * Typed errors for @browsercore/compression.
 *
 * Errors are part of the API — every failure mode is an explicit type so
 * callers can match on `kind` instead of parsing messages.
 */
/** Base class for all compression errors. Provides `cause` + constructor. */
export declare class CompressionError extends Error {
    readonly cause: Error | undefined;
    /**
     * The content-encoding token involved in the failure, when known.
     * Subclasses that carry the encoding by definition set it to a string.
     */
    readonly encoding?: string | undefined;
    constructor(message: string, options?: CompressionErrorOptions);
}
/**
 * The `content-encoding` token is not one we know how to decode.
 * Distinct from a corrupt stream — the encoding itself is unrecognized.
 */
export declare class UnsupportedEncodingError extends CompressionError {
    readonly kind: "UnsupportedEncodingError";
    /** The unsupported content-encoding token — always known, by definition. */
    readonly encoding: string;
    constructor(encoding: string, options?: CompressionErrorOptions);
}
/**
 * A recognized encoding failed to decode — the stream was corrupt,
 * truncated, or used the wrong framing. Wraps the underlying zlib error
 * as `cause` while hiding the backend-specific failure detail.
 */
export declare class DecompressionError extends CompressionError {
    readonly kind: "DecompressionError";
    /** The content-encoding token being decoded when the failure happened; undefined when unknown. */
    readonly encoding: string | undefined;
    constructor(encoding: string | undefined, options?: CompressionErrorOptions);
}
/**
 * Narrow an unknown thrown value to an Error. Preserves `cause` chains when
 * re-wrapping backend-specific failures as typed compression errors.
 */
export declare function toError(e: unknown): Error;
/**
 * Wrap an unknown thrown value as a typed {@link DecompressionError} for the
 * given encoding, or with an unknown encoding when none is supplied. Passes
 * through any existing {@link CompressionError} so double-wrapping never
 * happens.
 */
export declare function ensureCompressionError(e: unknown, encoding?: string): CompressionError;
//# sourceMappingURL=errors.d.ts.map