import path from 'path';
import fs from 'fs';

export const isPROD = process.env.NODE_ENV === 'production';

export const byPwd = (first: string, ...rest: string[]) => {
  const isAbs = path.isAbsolute(first);
  const prefix = isAbs ? first : process.cwd();
  const file = path.resolve(prefix, isAbs ? '' : first, ...rest);
  if (!fs.existsSync(path.dirname(file))) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  return file;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};
