import path from 'path';

export const isPROD = process.env.NODE_ENV === 'production';

export const byPwd = (first: string, ...rest: string[]) => {
  const isAbs = path.isAbsolute(first);
  const prefix = isAbs ? first : process.cwd();
  return path.resolve(prefix, isAbs ? '' : first, ...rest);
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};
