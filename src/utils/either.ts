/**
 * @file This module provides a functional implementation of the Either monad.
 * The Either type represents a value that can be one of two types:
 * a "Left" value (typically representing a failure or error) or
 * a "Right" value (typically representing a success or valid result).
 * This helps in handling errors explicitly without throwing exceptions,
 * promoting a more functional and predictable error handling pattern.
 */

/**
 * Represents the 'Left' side of an Either, typically indicating a failure or error.
 * @template L The type of the Left value (e.g., an Error object, a string message).
 */
export type Left<L> = {
  /** A discriminant property to identify this as a Left type. */
  readonly _tag: 'Left';
  /** The value held by the Left side. */
  readonly left: L;
};

/**
 * Represents the 'Right' side of an Either, typically indicating a success or valid result.
 * @template R The type of the Right value.
 */
export type Right<R> = {
  /** A discriminant property to identify this as a Right type. */
  readonly _tag: 'Right';
  /** The value held by the Right side. */
  readonly right: R;
};

/**
 * The Either type represents a value that is either a Left (failure) or a Right (success).
 * It is a union of the Left and Right types.
 * @template L The type of the Left value.
 * @template R The type of the Right value.
 */
export type Either<L, R> = Left<L> | Right<R>;

/**
 * Type alias for a Promise that resolves to an Either.
 * This represents an asynchronous operation that may fail.
 * @template L The type of the Left value (error).
 * @template R The type of the Right value (success).
 */
export type TaskEither<L, R> = Promise<Either<L, R>>;

/**
 * Creates a Left instance of Either.
 * Use this function to wrap an error or a failure value.
 * @template L The type of the Left value.
 * @template R The type of the Right value (inferred or explicitly provided for type completeness).
 * @param {L} l The value to be wrapped in the Left.
 * @returns {Left<L>} A Left instance containing the provided value.
 */
export const left = <L, R = never>(l: L): Left<L> => ({ _tag: 'Left', left: l });

/**
 * Creates a Right instance of Either.
 * Use this function to wrap a successful result.
 * @template L The type of the Left value (inferred or explicitly provided for type completeness).
 * @template R The type of the Right value.
 * @param {R} r The value to be wrapped in the Right.
 * @returns {Right<R>} A Right instance containing the provided value.
 */
export const right = <L = never, R = unknown>(r: R): Right<R> => ({ _tag: 'Right', right: r });

/**
 * Type guard to check if an Either instance is a Left.
 * @template L The type of the Left value.
 * @template R The type of the Right value.
 * @param {Either<L, R>} fa The Either instance to check.
 * @returns {fa is Left<L>} True if the instance is a Left, false otherwise.
 */
export const isLeft = <L, R>(fa: Either<L, R>): fa is Left<L> => fa._tag === 'Left';

/**
 * Type guard to check if an Either instance is a Right.
 * @template L The type of the Left value.
 * @template R The type of the Right value.
 * @param {Either<L, R>} fa The Either instance to check.
 * @returns {fa is Right<R>} True if the instance is a Right, false otherwise.
 */
export const isRight = <L, R>(fa: Either<L, R>): fa is Right<R> => fa._tag === 'Right';

/**
 * Applies a function to the value inside a Right, or returns the Left unchanged.
 * This is useful for transforming the successful result of an Either.
 * If the Either is a Left, the mapping function is not applied, and the Left is propagated.
 * @template L The type of the Left value.
 * @template R The type of the original Right value.
 * @template B The type of the new Right value after transformation.
 * @param {(r: R) => B} f The function to apply to the Right value.
 * @returns {(fa: Either<L, R>) => Either<L, B>} A function that takes an Either and returns a new Either.
 */
export const map = <L, R, B>(f: (r: R) => B) => (fa: Either<L, R>): Either<L, B> =>
  isLeft(fa) ? fa : right(f(fa.right));

/**
 * Chains a function that returns an Either to the value inside a Right.
 * This is useful for sequencing operations that can fail.
 * If the current Either is a Left, the chaining function is not applied, and the Left is propagated.
 * If the current Either is a Right, the chaining function is applied to its value,
 * and the result (which is another Either) is returned.
 * This effectively "flattens" nested Eithers.
 * @template L The type of the Left value.
 * @template R The type of the original Right value.
 * @template B The type of the new Right value after chaining.
 * @param {(r: R) => Either<L, B>} f The function to apply to the Right value, which itself returns an Either.
 * @returns {(fa: Either<L, R>) => Either<L, B>} A function that takes an Either and returns a new Either.
 */
export const flatMap = <L, R, B>(f: (r: R) => Either<L, B>) => (fa: Either<L, R>): Either<L, B> =>
  isLeft(fa) ? fa : f(fa.right);

/**
 * An alias for flatMap, commonly used in functional programming contexts.
 * @template L The type of the Left value.
 * @template R The type of the original Right value.
 * @template B The type of the new Right value after chaining.
 * @param {(r: R) => Either<L, B>} f The function to apply to the Right value, which itself returns an Either.
 * @returns {(fa: Either<L, R>) => Either<L, B>} A function that takes an Either and returns a new Either.
 */
export const chain = flatMap;

/**
 * Wraps a function that might throw an exception into an Either.
 * If the function executes successfully, it returns a Right containing the result.
 * If the function throws an error, it returns a Left containing the caught error.
 *
 * @template L The type of the Left value (the error type).
 * @template R The type of the Right value (the success type).
 * @param {() => R | Promise<R>} f The function to execute, which might throw an exception or return a Promise.
 * @param {(e: unknown) => L} onError A function to transform the caught error into the Left type L.
 * @returns {TaskEither<L, R>} A Promise that resolves to an Either containing either the error (Left) or the result (Right).
 */
export const tryCatch = async <L, R>(f: () => R | Promise<R>, onError: (e: unknown) => L): TaskEither<L, R> => {
  try {
    const result = await Promise.resolve(f());
    return right(result);
  } catch (e) {
    return left(onError(e));
  }
};

/**
 * Applies one of two functions to an Either, depending on whether it's a Left or a Right.
 * This is useful for handling both success and failure cases in a single expression.
 * @template L The type of the Left value.
 * @template R The type of the Right value.
 * @template B The return type of both functions.
 * @param {(l: L) => B} onLeft The function to apply if the Either is a Left.
 * @param {(r: R) => B} onRight The function to apply if the Either is a Right.
 * @returns {(fa: Either<L, R>) => B} A function that takes an Either and returns a value of type B.
 */
export const fold = <L, R, B>(onLeft: (l: L) => B, onRight: (r: R) => B) => (fa: Either<L, R>): B =>
  isLeft(fa) ? onLeft(fa.left) : onRight(fa.right);

/**
 * Applies a function to the value inside a Right of a TaskEither, or returns the Left unchanged.
 * This is useful for transforming the successful result of an asynchronous operation.
 * If the TaskEither resolves to a Left, the mapping function is not applied, and the Left is propagated.
 * @template L The type of the Left value.
 * @template R The type of the original Right value.
 * @template B The type of the new Right value after transformation.
 * @param {(r: R) => B} f The function to apply to the Right value.
 * @returns {(fa: TaskEither<L, R>) => TaskEither<L, B>} A function that takes a TaskEither and returns a new TaskEither.
 */
export const mapTaskEither = <L, R, B>(f: (r: R) => B) => async (fa: TaskEither<L, R>): TaskEither<L, B> => {
  const either: Either<L, R> = await fa;
  return isLeft(either) ? left(either.left) : right(f(either.right));
};

/**
 * Chains a function that returns a TaskEither to the value inside a Right of a TaskEither.
 * This is useful for sequencing asynchronous operations that can fail.
 * If the current TaskEither resolves to a Left, the chaining function is not applied, and the Left is propagated.
 * If the current TaskEither resolves to a Right, the chaining function is applied to its value,
 * and the result (which is another TaskEither) is returned.
 * This effectively "flattens" nested TaskEithers.
 * @template L The type of the Left value.
 * @template R The type of the original Right value.
 * @template B The type of the new Right value after chaining.
 * @param {(r: R) => TaskEither<L, B>} f The function to apply to the Right value, which itself returns a TaskEither.
 * @returns {(fa: TaskEither<L, R>) => TaskEither<L, B>} A function that takes a TaskEither and returns a new TaskEither.
 */
export const flatMapTaskEither = <L, R, B>(f: (r: R) => TaskEither<L, B>) => async (fa: TaskEither<L, R>): TaskEither<L, B> => {
  const either: Either<L, R> = await fa;
  return isLeft(either) ? left(either.left) : f(either.right);
};

/**
 * Converts an Either to a TaskEither.
 * @template L The type of the Left value.
 * @template R The type of the Right value.
 * @param {Either<L, R>} either The Either instance to convert.
 * @returns {TaskEither<L, R>} A TaskEither that immediately resolves to the given Either.
 */
export const fromEither = <L, R>(either: Either<L, R>): TaskEither<L, R> => {
  return Promise.resolve(either);
};

// --- Custom Error Types ---

/**
 * Represents an error that occurs during database operations.
 */
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "DatabaseError";
  }
}

/**
 * Represents an error that occurs during file system operations.
 */
export class FileError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "FileError";
  }
}

/**
 * Represents an error that occurs during data validation.
 */
export class ValidationError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "ValidationError";
  }
}