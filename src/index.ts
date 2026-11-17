/**
 * @browsercore/compression — public API surface.
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
 */

export type { CompressionProvider } from "./types.js";
export type { ContentEncoding } from "./types.js";
export { SUPPORTED_ENCODINGS } from "./types.js";

export {
    CompressionError,
    DecompressionError,
    UnsupportedEncodingError,
    ensureCompressionError,
} from "./errors.js";

export { assertNever } from "./utils.js";
