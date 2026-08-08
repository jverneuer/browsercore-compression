/**
 * @browsercore/compression — public API surface.
 *
 * A clean abstraction wrapping compression primitives. HTTP layers — never
 * `node:zlib` directly — call these methods so the backend is replaceable
 * (WebCompressionStream, wasm brotli, test double).
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
