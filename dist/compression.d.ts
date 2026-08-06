/**
 * CompressionProvider — pure compression primitive abstraction.
 *
 * Wraps Node's native zlib APIs so HTTP layers never import `node:zlib`
 * directly. The backend is replaceable (WebCompressionStream, wasm brotli,
 * test double) through this interface.
 *
 * All operations are synchronous and I/O-free, which keeps them unit-testable.
 * Every method takes and returns `Uint8Array` — never Node `Buffer`.
 *
 * @module
 * @since 0.1.0
 */
import type { CompressionProvider } from "./types.js";
/**
 * `node:zlib`-backed implementation of {@link CompressionProvider}.
 *
 * The production HTTP layers call the default singleton (`compression`) — they
 * never construct this class directly. Tests inject a fake provider through
 * the `CompressionProvider` interface.
 *
 * @example
 * ```ts
 * import { compression } from "@browsercore/compression";
 * const decompressed = compression.decompress(responseBytes, "br");
 * ```
 *
 * @since 0.1.0
 */
export declare class NodeZlibCompressionProvider implements CompressionProvider {
    /** {@inheritDoc CompressionProvider.gzip} */
    gzip(data: Uint8Array): Uint8Array;
    /** {@inheritDoc CompressionProvider.gunzip} */
    gunzip(data: Uint8Array): Uint8Array;
    /** {@inheritDoc CompressionProvider.deflate} */
    deflate(data: Uint8Array): Uint8Array;
    /** {@inheritDoc CompressionProvider.inflate} */
    inflate(data: Uint8Array): Uint8Array;
    /** {@inheritDoc CompressionProvider.inflateRaw} */
    inflateRaw(data: Uint8Array): Uint8Array;
    /** {@inheritDoc CompressionProvider.brotliCompress} */
    brotliCompress(data: Uint8Array): Uint8Array;
    /** {@inheritDoc CompressionProvider.brotliDecompress} */
    brotliDecompress(data: Uint8Array): Uint8Array;
    /** {@inheritDoc CompressionProvider.decompress} */
    decompress(data: Uint8Array, encoding: string): Uint8Array;
}
/**
 * Default compression backend HTTP layers call into.
 *
 * Backed by `node:zlib`. Replaceable for tests or alternative runtimes by
 * constructing a different {@link CompressionProvider} implementation.
 *
 * @example
 * ```ts
 * import { compression } from "@browsercore/compression";
 * const compressed = compression.gzip(new TextEncoder().encode("hello"));
 * ```
 *
 * @since 0.1.0
 */
export declare const compression: NodeZlibCompressionProvider;
//# sourceMappingURL=compression.d.ts.map