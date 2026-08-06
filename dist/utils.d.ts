/**
 * Small shared helpers for @browsercore/compression.
 *
 * @module
 * @since 0.1.0
 */
/**
 * Exhaustiveness check for discriminated unions.
 *
 * Use as the `default` branch of a `switch` so adding a new case forces every
 * handler to compile-error until handled.
 *
 * @param x The value that should never reach this branch (typed as `never`).
 * @returns Never returns — always throws.
 *
 * @example
 * ```ts
 * switch (encoding) {
 *   case "gzip": return gunzip(data);
 *   case "deflate": return inflate(data);
 *   case "br": return brotliDecompress(data);
 *   case "identity": return data;
 *   default: return assertNever(encoding);
 * }
 * ```
 *
 * @throws {Error} Always — indicates an unhandled case.
 * @since 0.1.0
 */
export declare function assertNever(x: never): never;
//# sourceMappingURL=utils.d.ts.map