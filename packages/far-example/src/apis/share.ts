export const setPage = <T extends any[]>(
  records: T,
  info: { current: number; size: number; total: number },
) => {
  return { records, ...info };
  /** 这么写也可 */
  // return { records, ...info } as Page<T>;
};
export type PageQuery<TQuery> = {
  current: number;
  size: number;
} & TQuery;
