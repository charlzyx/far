// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Shape {
  export type PageQuery<TQuery> = {
    current: number;
    size: number;
  } & TQuery;

  export type Page<Records> = {
    records: Records;
    current: number;
    size: number;
    total: number;
  };
}
