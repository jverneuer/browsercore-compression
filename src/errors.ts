/**
 * Typed errors for @browsercore/compression.
 *
 * Errors are part of the API — every failure mode is an explicit type so
 * callers can match on `kind` instead of parsing messages.
 *
 * @module
 * @since 0.1.0
 */

/**
 * Base class for all compression errors.
 *
 * Provides `cause` + constructor. All typed compression errors extend this
 * class, so `instanceof CompressionError` catches every failure from the
 * provider.
 *
 * @since 0.1.0
 */
export class CompressionError extends Error {
    /** Optional cause chain for wrapping backend-specific failures. */
    public override readonly cause: Error | undefined;

    /**
     * Create a {@link CompressionError}.
     *
     * @param message Human-readable error message.
     * @param options Optional cause chain.
     * @param options.cause The underlying error that caused this failure.
     */
    constructor(message: string, options?: { cause?: Error }) {
        super(message, options);
        this.name = new.target.name;
        this.cause = options?.cause;
    }
}

/**
 * The `content-encoding` token is not one we know how to decode.
 *
 * Distinct from a corrupt stream — the encoding itself is unrecognized.
 *
 * @since 0.1.0
 */
export class UnsupportedEncodingError extends CompressionError {
    public readonly kind = "UnsupportedEncodingError" as const;
    /** The unsupported content-encoding token. */
    public readonly encoding: string;

    /**
     * Create an {@link UnsupportedEncodingError}.
     *
     * @param encoding The unrecognized content-encoding token.
     * @param options  Optional cause chain.
     */
    constructor(encoding: string, options?: { cause?: Error }) {
        super(`Unsupported content-encoding: ${encoding}`, options);
        this.encoding = encoding;
    }
}

/**
 * A recognized encoding failed to decode.
 *
 * The stream was corrupt, truncated, or used the wrong framing. Wraps the
 * underlying zlib error as `cause` while hiding the backend-specific failure
 * detail.
 *
 * @since 0.1.0
 */
export class DecompressionError extends CompressionError {
    public readonly kind = "DecompressionError" as const;
    /** The content-encoding token being decoded when the failure happened. */
    public readonly encoding: string;

    /**
     * Create a {@link DecompressionError}.
     *
     * @param encoding The content-encoding token being decoded.
     * @param options  Optional cause chain.
     * @param options.cause The underlying backend error that caused this failure.
     */
    constructor(encoding: string, options?: { cause?: Error }) {
        super(`Failed to decompress ${encoding} stream`, options);
        this.encoding = encoding;
    }
}

/**
 * Narrow an unknown thrown value to an `Error`.
 *
 * Preserves `cause` chains when re-wrapping backend-specific failures as
 * typed compression errors.
 *
 * @param e The caught unknown value.
 * @returns An `Error` — either `e` itself (if already an `Error`) or a new wrapping instance.
 *
 * @since 0.1.0
 */
export function toError(e: unknown): Error {
    if (e instanceof Error) {
        return e;
    }
    return new Error(typeof e === "string" ? e : "unknown error");
}

/**
 * Wrap an unknown thrown value as a typed {@link DecompressionError} for the
 * given encoding.
 *
 * Passes through any existing {@link CompressionError} so double-wrapping
 * never happens. Use this at API boundaries to guarantee that every thrown
 * value is a typed {@link CompressionError} subclass.
 *
 * @param e         The caught unknown value.
 * @param encoding  The content-encoding token being decoded.
 * @returns A typed {@link CompressionError} — either `e` itself (if already typed)
 *          or a new wrapping {@link DecompressionError}.
 *
 * @example
 * ```ts
 * try {
 *   return inflateSync(data);
 * } catch (err) {
 *   throw ensureCompressionError(err, "deflate");
 * }
 * ```
 *
 * @since 0.1.0
 */
export function ensureCompressionError(e: unknown, encoding: string): CompressionError {
    if (e instanceof CompressionError) {
        return e;
    }
    return new DecompressionError(encoding, { cause: toError(e) });
}
