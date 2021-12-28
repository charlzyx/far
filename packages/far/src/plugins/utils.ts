import type { FarPlugin } from './index';

export const sort = (plugins: FarPlugin[]) => {
  const clone = [...plugins];
  return clone;
};
