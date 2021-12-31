import { tai } from '@rlx/tai';
import { PageQuery, setPage } from '../share';
import { logger, useCtx } from '@rlx/far';

const wait = (time = 1000, cb: () => void) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      cb();
      resolve('');
    }, time);
  });
};

/**
 * Model App
 *
 */
export type App = {
  id: number;
  name: string;
  updateTime: Date;
};

export const appSaveUp = tai
  .desc('保存/更新App')
  .post('/app')
  .go(async (app: Omit<App, 'updateTime'>) => {
    const ctx = useCtx(); // Koa ctx!!

    await wait(233, () => {
      const ctx2 = useCtx(); // ctx2 === ctx
      ctx2.logger === logger; // ✨
    });

    ctx.logger.info('ohhhhhhhh');
    return { id: 1, name: '', neo: app };
  });

export const delApp = tai
  .desc('根据id删除App')
  .delete('/app/:id')
  .go(
    async (
      input: {
        面对疾风吧: '';
      },
      params,
    ) => ({ message: '就这样罢!', id: `${params.id}` }),
  );

export const listApp = tai
  .desc('查看Applist')
  .get('/app/list')
  .go(async (input: PageQuery<Pick<App, 'name'>>, params) => {
    const list: App[] = [{ id: 777, name: '13', updateTime: new Date() }];

    return setPage(list, { current: 1, size: 10, total: 20 });
  });
