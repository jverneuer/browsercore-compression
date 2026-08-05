/**
 * CompressionProvider — pure compression primitive abstraction.
 *
 * Wraps Node's native zlib APIs so HTTP layers never import `node:zlib`
 * directly. The backend is replaceable (WebCompressionStream, wasm brotli,
 * test double) through this interface.
 *
 * All operations are synchronous and I/O-free, which keeps them unit-testable.
 * Every method takes and returns `Uint8Array` — never Node `Buffer`.
 */
import type { CompressionProvider } from "./types.js";
/**
 * `node:zlib`-backed implementation of {@link CompressionProvider}.
 *
 * The production HTTP layers call the default singleton (`compression`) — they
 * never construct this class directly. Tests inject a fake provider through
 * the `CompressionProvider` interface.
 */
export declare class NodeZlibCompressionProvider implements CompressionProvider {
    gzip(data: Uint8Array): Uint8Array;
    gunzip(data: Uint8Array): Uint8Array;
    deflate(data: Uint8Array): Uint8Array;
    inflate(data: Uint8Array): Uint8Array;
    inflateRaw(data: Uint8Array): Uint8Array;
    brotliCompress(data: Uint8Array): Uint8Array;
    brotliDecompress(data: Uint8Array): Uint8Array;
    decompress(data: Uint8Array, encoding: string): Uint8Array;
}
/**
 * Default compression backend HTTP layers call into. Backed by `node:zlib`.
 * Replaceable for tests or alternative runtimes.
 */
export declare const compression: NodeZlibCompressionProvider;
//# sourceMappingURL=compression.d.ts.map