/**
 * Domain types for @browsercore/compression.
 *
 * A clean abstraction wrapping Node's native zlib APIs. HTTP layers — never
 * `node:zlib` directly — call these methods so the backend is replaceable
 * (WebCompressionStream, a test double, a wasm brotli impl).
 *
 * The `ContentEncoding` union is the set of content-encoding tokens this
 * package knows how to decode. It is intentionally a literal union, never a
 * bare `string`, so exhaustiveness can be checked at compile time.
 *
 * @module
 * @since 0.1.0
 */

/**
 * Content-encoding tokens we can decode.
 *
 * Literal union, never bare `string`, so exhaustiveness can be checked at
 * compile time. Each value matches a registered HTTP `Content-Encoding`
 * token (RFC 9110 §8.4).
 *
 * @since 0.1.0
 */
export type ContentEncoding = "gzip" | "deflate" | "br" | "identity";

/**
 * The set of content-encoding tokens we can decode, as a runtime array.
 *
 * `identity` is included for exhaustiveness but is a no-op (no decompression).
 * Useful for iterating supported encodings or validating user input.
 *
 * @example
 * ```ts
 * if (SUPPORTED_ENCODINGS.includes(token as ContentEncoding)) { ... }
 * ```
 *
 * @since 0.1.0
 */
export const SUPPORTED_ENCODINGS: readonly ContentEncoding[] = [
    "gzip",
    "deflate",
    "br",
    "identity",
];

/**
 * Pure compression primitive abstraction HTTP layers depend on.
 *
 * Every method takes and returns `Uint8Array` — never Node `Buffer` — so the
 * interface is portable across backends. All operations are synchronous and
 * I/O-free, which keeps them unit-testable.
 *
 * @remarks
 * The provider pattern decouples compression logic from platform I/O. This is
 * what keeps the HTTP layers agnostic to whether the backend is `node:zlib`,
 * `WebCompressionStream`, or a wasm brotli implementation.
 *
 * @see {@link NodeZlibCompressionProvider} for the default `node:zlib` backend.
 * @since 0.1.0
 */
export interface CompressionProvider {
    /**
     * Compress `data` with gzip.
     *
     * @param data Raw input bytes.
     * @returns Gzip-compressed bytes (with gzip header + trailer).
     *
     * @example
     * ```ts
     * const compressed = compression.gzip(new TextEncoder().encode("hello"));
     * ```
     */
    gzip(data: Uint8Array): Uint8Array;

    /**
     * Decompress a gzip-encoded `data`.
     *
     * @param data Gzip-compressed bytes.
     * @returns Decompressed bytes.
     * @throws {@link DecompressionError} on a corrupt or truncated stream.
     */
    gunzip(data: Uint8Array): Uint8Array;

    /**
     * Compress `data` with zlib-wrapped deflate.
     *
     * Produces a stream with a zlib header and Adler-32 trailer.
     *
     * @param data Raw input bytes.
     * @returns Zlib-wrapped deflate-compressed bytes.
     */
    deflate(data: Uint8Array): Uint8Array;

    /**
     * Decompress a zlib-wrapped deflate `data`.
     *
     * @param data Zlib-wrapped deflate-compressed bytes.
     * @returns Decompressed bytes.
     * @throws {@link DecompressionError} on a corrupt or truncated stream.
     */
    inflate(data: Uint8Array): Uint8Array;

    /**
     * Decompress a raw (headerless) deflate `data`.
     *
     * Used as a fallback when the server sends raw deflate instead of the
     * RFC-mandated zlib-wrapped framing.
     *
     * @param data Raw deflate-compressed bytes (no zlib header/trailer).
     * @returns Decompressed bytes.
     * @throws {@link DecompressionError} on a corrupt or truncated stream.
     */
    inflateRaw(data: Uint8Array): Uint8Array;

    /**
     * Compress `data` with brotli.
     *
     * @param data Raw input bytes.
     * @returns Brotli-compressed bytes.
     */
    brotliCompress(data: Uint8Array): Uint8Array;

    /**
     * Decompress a brotli-encoded `data`.
     *
     * @param data Brotli-compressed bytes.
     * @returns Decompressed bytes.
     * @throws {@link DecompressionError} on a corrupt or truncated stream.
     */
    brotliDecompress(data: Uint8Array): Uint8Array;

    /**
     * Decompress a body according to a `content-encoding` header value.
     *
     * Implements browser-tolerant decoding:
     *   - `gzip` / `x-gzip` → gunzip
     *   - `deflate` → try zlib-wrapped inflate first, fall back to raw inflate
     *     (servers disagree on framing; browsers tolerate both)
     *   - `br` → brotli decompress
     *   - `identity` (or empty) → no-op
     *
     * @param data     Compressed bytes.
     * @param encoding The `Content-Encoding` header value (case-insensitive).
     * @returns Decompressed bytes.
     *
     * @throws {@link UnsupportedEncodingError} on an unrecognized encoding token.
     * @throws {@link DecompressionError} on a corrupt or truncated stream.
     *
     * @example
     * ```ts
     * const body = compression.decompress(responseBytes, "gzip");
     * ```
     *
     * @see {@link SUPPORTED_ENCODINGS} for the list of recognized tokens.
     */
    decompress(data: Uint8Array, encoding: string): Uint8Array;
}
