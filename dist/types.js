/**
 * Domain types for @browsercore/compression.
 *
 * A clean abstraction covering compression primitives. HTTP layers — never
 * a specific backend directly — call these methods so the implementation is
 * replaceable by any *synchronous* backend (the node:zlib adapter in
 * browsersmith, a wasm build with sync exports, a test double). The contract
 * is sync by design, so async-native APIs (CompressionStream /
 * DecompressionStream) cannot implement it — see the design-decisions note
 * in @browsercore/contracts >= 0.2.6.
 *
 * The Node-backed implementation (NodeZlibCompressionProvider) lives in
 * `browsersmith/src/platform/compression/node/` — this package exports
 * only pure types, errors, and utilities with zero `node:*` imports.
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
//# sourceMappingURL=types.js.map