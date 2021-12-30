import { Context, Next } from 'koa';

export default () => {
  return async (ctx: Context, next: Next) => {
    ctx.req.headers['x-request-id'] =
      ctx.req.headers['x-request-id'] ?? new Date().toString();
    console.log('enter', ctx.req.url);
    next();
    console.log('leave', ctx.req.url);
  };
};
