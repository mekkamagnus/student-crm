export type Either<L, R> = Left<L> | Right<R>;

export class Left<L> {
  readonly left: L;

  constructor(value: L) {
    this.left = value;
  }

  isLeft(): this is Left<L> {
    return true;
  }

  isRight(): this is Right<any> {
    return false;
  }
}

export class Right<R> {
  readonly right: R;

  constructor(value: R) {
    this.right = value;
  }

  isLeft(): this is Left<any> {
    return false;
  }

  isRight(): this is Right<R> {
    return true;
  }
}

export const left = <L>(l: L): Left<L> => {
  return new Left(l);
};

export const right = <R>(r: R): Right<R> => {
  return new Right(r);
};

export const tryCatch = async <L, R>(
  f: () => Promise<R>,
  onError: (e: unknown) => L,
): Promise<Either<L, R>> => {
  try {
    return right(await f());
  } catch (e) {
    return left(onError(e));
  }
};

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> => {
  return either.isLeft();
};

export const isRight = <L, R>(either: Either<L, R>): either is Right<R> => {
  return either.isRight();
};

export class FileError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "FileError";
  }
}
