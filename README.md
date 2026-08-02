# @browsercore/compression

[![npm version](https://img.shields.io/npm/v/@browsercore/compression)](https://www.npmjs.com/package/@browsercore/compression)
[![coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/jverneuer/browsercore-compression/main/coverage/badge.json)](https://github.com/jverneuer/browsercore-compression/blob/main/COVERAGE.md)
[![lint](https://img.shields.io/github/actions/workflow/status/jverneuer/browsercore-compression/ci.yml?label=lint)](https://github.com/jverneuer/browsercore-compression/actions/workflows/ci.yml)

A clean abstraction wrapping Node's native zlib APIs. HTTP layers never import
`node:zlib` directly — they call through this package so the backend is
replaceable (WebCompressionStream, wasm brotli, a test double).

## Install

```sh
npm install @browsercore/compression
```

## Responsibility

Compression primitives — gzip, deflate (zlib-wrapped + raw), and brotli, in both
directions — plus a `decompress()` helper that maps a `content-encoding` header
token to the right decoder. All operations are synchronous and I/O-free, which
keeps them unit-testable.

The `decompress()` helper implements browser-tolerant `deflate` decoding: it
tries the RFC-mandated zlib-wrapped form first and falls back to raw inflate,
because servers disagree on framing and browsers tolerate both.

Higher layers compose exclusively through the `CompressionProvider` interface;
the production HTTP implementations **never** call `node:zlib` directly.

## Public API

```ts
import {
    compression,
    NodeZlibCompressionProvider,
    CompressionProvider,
} from "@browsercore/compression";

// Use the default singleton (backed by node:zlib):
const compressed = compression.gzip(body);
const plain = compression.decompress(body, headers.get("content-encoding") ?? "");

// Or inject a custom provider (e.g. for tests):
const provider: CompressionProvider = new NodeZlibCompressionProvider();
const encoded = provider.brotliCompress(body);
```

## Types

| Export | Kind | Purpose |
| --- | --- | --- |
| `compression` | singleton | Default `node:zlib`-backed backend higher layers call into |
| `NodeZlibCompressionProvider` | class | `node:zlib`-backed implementation of the provider interface |
| `CompressionProvider` | interface | Pure compression primitive abstraction higher layers depend on |
| `ContentEncoding` | literal union | `gzip \| deflate \| br \| identity` |
| `SUPPORTED_ENCODINGS` | const array | Runtime list of supported tokens (includes the no-op `identity`) |
| `CompressionError` | class | Base typed error; provides `cause` |
| `UnsupportedEncodingError` | class | Unrecognized `content-encoding` token |
| `DecompressionError` | class | Corrupt / truncated / wrongly-framed stream |
| `ensureCompressionError()` | function | Wrap a thrown value as a typed error (passes through existing ones) |
| `assertNever()` | function | Exhaustiveness check for discriminated unions |

## Dependency graph

```
@browsercore/compression
  └─ node:zlib
```

No other `@browsercore/*` packages are imported.

## License

MIT
