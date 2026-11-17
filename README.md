# @browsercore/compression

[![npm version](https://img.shields.io/npm/v/@browsercore/compression)](https://www.npmjs.com/package/@browsercore/compression)
[![coverage](https://img.shields.io/endpoint?url=https://jverneuer.github.io/browsercore-compression/badge.json)](https://github.com/jverneuer/browsercore-compression/blob/main/COVERAGE.md)
[![lint](https://img.shields.io/github/actions/workflow/status/jverneuer/browsercore-compression/ci.yml?label=lint)](https://github.com/jverneuer/browsercore-compression/actions/workflows/ci.yml)

The synchronous `CompressionProvider` contract for the browsercore stack:
gzip, deflate (zlib-wrapped + raw), and brotli in both directions, plus typed
errors and the `content-encoding` token set. HTTP layers never import
`node:zlib` directly — they call through this interface.

**The interface is synchronous by design.** Any *synchronous* backend can
implement it: the `node:zlib` adapter wired in
[browsersmith](https://github.com/jverneuer/browsersmith)
(`src/platform/compression/node/`), a wasm build with sync exports, or a test
double. Async-native streaming APIs — `CompressionStream` /
`DecompressionStream` (a.k.a. WebCompressionStream) — **cannot** implement it:
a Promise-based streaming API cannot be served from a sync method signature.
The canonical rationale lives in the design-decisions note shipped with
[`@browsercore/contracts` ≥ 0.2.6](https://github.com/jverneuer/browsercore-contracts/blob/main/docs/design-decisions.md).

This package exports only the contract, tokens, typed errors, and utilities —
zero `node:*` imports. The concrete `NodeZlibCompressionProvider` is wired in
the browsersmith adapter.

## Install

```sh
npm install @browsercore/compression
```

## Responsibility

The `CompressionProvider` interface covers compression primitives — gzip,
deflate (zlib-wrapped + raw), and brotli, in both directions — plus a
`decompress()` method that maps a `content-encoding` header token to the right
decoder. All operations are synchronous and I/O-free, which keeps
implementations unit-testable.

`decompress()` specifies browser-tolerant `deflate` decoding: try the
RFC-mandated zlib-wrapped form first and fall back to raw inflate, because
servers disagree on framing and browsers tolerate both.

Higher layers compose exclusively through the `CompressionProvider` interface;
the production HTTP implementations **never** call `node:zlib` directly —
browsersmith injects the adapter.

## Public API

```ts
import type { CompressionProvider } from "@browsercore/compression";

// Implement the sync contract with any SYNC backend — e.g. browsersmith's
// node:zlib adapter, a wasm build with sync exports, or a test double.
// Async-native CompressionStream/DecompressionStream cannot implement it:
const provider: CompressionProvider = mySyncProvider;
const compressed = provider.gzip(body);
const plain = provider.decompress(body, "gzip");
```

## Types

| Export | Kind | Purpose |
| --- | --- | --- |
| `CompressionProvider` | interface | Synchronous compression-primitive abstraction higher layers depend on; async-native streaming APIs cannot implement it |
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
  (no runtime dependencies — zero node:* imports)
```

The `node:zlib` implementation (`NodeZlibCompressionProvider`) lives in the
browsersmith adapter, not in this package.

## Position in BrowserCore

```
   @browsercore/http1 / @browsercore/http2 / @browsercore/http3
      │
   @browsercore/compression   (contract — sync, I/O-free)
      ▲
   browsersmith adapter ── node:zlib
```

Every higher networking layer communicates with the network exclusively through the layers below it.

## License

MIT
