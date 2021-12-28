import path from 'path';

export const byPwd = (first: string, ...rest: string[]) => {
  const prefix = path.isAbsolute(first) ? first : process.cwd();
  return path.resolve(prefix, ...rest);
};
