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
 */
/**
 * The set of content-encoding tokens we can decode, as a runtime array.
 * `identity` is included for exhaustiveness but is a no-op (no decompression).
 */
export const SUPPORTED_ENCODINGS = [
    "gzip",
    "deflate",
    "br",
    "identity",
];
