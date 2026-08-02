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

import {
    gunzipSync,
    gzipSync,
    inflateSync,
    inflateRawSync,
    deflateSync,
    brotliCompressSync,
    brotliDecompressSync,
} from "node:zlib";
import type { CompressionProvider, ContentEncoding } from "./types.js";
import { DecompressionError, UnsupportedEncodingError, ensureCompressionError } from "./errors.js";
import { assertNever } from "./utils.js";

/**
 * The native zlib backend's output: a Node `Buffer` (a `Uint8Array` subclass)
 * or a plain `Uint8Array`. Callers outside this package consume plain
 * `Uint8Array`, so we canonicalize at the boundary.
 */
type ZlibOutput = Uint8Array | Buffer;

/**
 * Normalize a zlib backend's output to a fresh `Uint8Array`, detaching it from
 * any underlying `Buffer` pool. Canonicalizes here at the boundary so callers
 * never see a Node `Buffer`.
 */
function toUint8Array(data: ZlibOutput): Uint8Array {
    return new Uint8Array(data);
}

/**
 * Parse a free-form `content-encoding` header value into a known
 * {@link ContentEncoding}. Browser-tolerant: case-insensitive, trims
 * whitespace, treats `x-gzip` as gzip and the empty token as identity.
 *
 * Returns `null` for an unrecognized token — the caller is responsible for
 * surfacing that as an {@link UnsupportedEncodingError}.
 */
function parseEncoding(encoding: string): ContentEncoding | null {
    switch (encoding.trim().toLowerCase()) {
        case "gzip":
        case "x-gzip":
            return "gzip";
        case "deflate":
            return "deflate";
        case "br":
            return "br";
        case "identity":
        case "":
            return "identity";
        default:
            return null;
    }
}

/**
 * Run a zlib sync decoder and wrap any failure as a typed
 * {@link DecompressionError} for the given encoding. Keeps the backend's
 * opaque error on `cause` without leaking it into the public API.
 */
function decodeWith(
    fn: (b: Uint8Array) => ZlibOutput,
    data: Uint8Array,
    encoding: ContentEncoding,
): Uint8Array {
    try {
        return toUint8Array(fn(data));
    } catch (err) {
        throw ensureCompressionError(err, encoding);
    }
}

/**
 * `node:zlib`-backed implementation of {@link CompressionProvider}.
 *
 * The production HTTP layers call the default singleton (`compression`) — they
 * never construct this class directly. Tests inject a fake provider through
 * the `CompressionProvider` interface.
 */
export class NodeZlibCompressionProvider implements CompressionProvider {
    public gzip(data: Uint8Array): Uint8Array {
        return toUint8Array(gzipSync(data));
    }

    public gunzip(data: Uint8Array): Uint8Array {
        return decodeWith((b) => gunzipSync(b), data, "gzip");
    }

    public deflate(data: Uint8Array): Uint8Array {
        return toUint8Array(deflateSync(data));
    }

    public inflate(data: Uint8Array): Uint8Array {
        return decodeWith((b) => inflateSync(b), data, "deflate");
    }

    public inflateRaw(data: Uint8Array): Uint8Array {
        return decodeWith((b) => inflateRawSync(b), data, "deflate");
    }

    public brotliCompress(data: Uint8Array): Uint8Array {
        return toUint8Array(brotliCompressSync(data));
    }

    public brotliDecompress(data: Uint8Array): Uint8Array {
        return decodeWith((b) => brotliDecompressSync(b), data, "br");
    }

    public decompress(data: Uint8Array, encoding: string): Uint8Array {
        const parsed = parseEncoding(encoding);
        if (parsed === null) {
            throw new UnsupportedEncodingError(encoding);
        }
        switch (parsed) {
            case "gzip":
                return this.gunzip(data);
            case "deflate": {
                // Servers disagree on framing: some send a zlib-wrapped stream
                // (what the RFC calls for), some send raw deflate. Browsers
                // tolerate both — try zlib first, fall back to raw inflate.
                try {
                    return this.inflate(data);
                } catch (zlibErr) {
                    // Only a decode failure justifies the raw-fallback: anything
                    // else (programming error, OOM) is not a framing problem and
                    // must surface unchanged rather than being masked by a retry.
                    if (zlibErr instanceof DecompressionError) {
                        return this.inflateRaw(data);
                    }
                    throw zlibErr;
                }
            }
            case "br":
                return this.brotliDecompress(data);
            case "identity":
                return data;
            default:
                // `parsed` is a `ContentEncoding`; every variant is handled above.
                // Adding a new member to that union makes this line compile-error
                // until a case is added here.
                return assertNever(parsed);
        }
    }
}

/**
 * Default compression backend HTTP layers call into. Backed by `node:zlib`.
 * Replaceable for tests or alternative runtimes.
 */
export const compression = new NodeZlibCompressionProvider();
