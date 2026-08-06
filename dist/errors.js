/**
 * Typed errors for @browsercore/compression.
 *
 * Errors are part of the API — every failure mode is an explicit type so
 * callers can match on `kind` instead of parsing messages.
 */
/** Base class for all compression errors. Provides `cause` + constructor. */
export class CompressionError extends Error {
    cause;
    constructor(message, options) {
        super(message, options);
        this.name = new.target.name;
        this.cause = options?.cause;
    }
}
/**
 * The `content-encoding` token is not one we know how to decode.
 * Distinct from a corrupt stream — the encoding itself is unrecognized.
 */
export class UnsupportedEncodingError extends CompressionError {
    kind = "UnsupportedEncodingError";
    /** The unsupported content-encoding token. */
    encoding;
    constructor(encoding, options) {
        super(`Unsupported content-encoding: ${encoding}`, options);
        this.encoding = encoding;
    }
}
/**
 * A recognized encoding failed to decode — the stream was corrupt,
 * truncated, or used the wrong framing. Wraps the underlying zlib error
 * as `cause` while hiding the backend-specific failure detail.
 */
export class DecompressionError extends CompressionError {
    kind = "DecompressionError";
    /** The content-encoding token being decoded when the failure happened. */
    encoding;
    constructor(encoding, options) {
        super(`Failed to decompress ${encoding} stream`, options);
        this.encoding = encoding;
    }
}
/**
 * Narrow an unknown thrown value to an Error. Preserves `cause` chains when
 * re-wrapping backend-specific failures as typed compression errors.
 */
export function toError(e) {
    if (e instanceof Error) {
        return e;
    }
    return new Error(typeof e === "string" ? e : "unknown error");
}
/**
 * Wrap an unknown thrown value as a typed {@link DecompressionError} for the
 * given encoding. Passes through any existing {@link CompressionError} so
 * double-wrapping never happens.
 */
export function ensureCompressionError(e, encoding) {
    if (e instanceof CompressionError) {
        return e;
    }
    return new DecompressionError(encoding, { cause: toError(e) });
}
//# sourceMappingURL=errors.js.map