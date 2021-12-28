import { tai } from '@rlx/tai';
import { PageQuery, setPage } from '../share';

// eslint-disable-next-line no-shadow
const enum VersionStatus {
  release = 'release',
  deprecated = 'deprecated',
  notready = 'notready',
}

/**
 * Model Version
 *
 */
export type Version = {
  id: number;
  summary: string;
  appId: number;
  status: VersionStatus;
};

export const appVersionSaveUp = tai
  .desc('保存/更新Version')
  .post('/version/:appId')
  .go(async (version: Version, params) => {
    return version;
  });

export const delAppVersion = tai
  .desc('根据id删除Version')
  .delete('/version/:id')
  .go(async (_, params) => {
    return {
      id: params.id,
      message: '成功',
    };
  });

export const listApp = tai
  .desc('查看App对应的versions')
  .get('/version/:appId/list')
  .go(async (input: PageQuery<Pick<Version, 'summary' | 'status'>>, params) => {
    const { current = 0, size = 10 } = input;
    const list: Version[] = [
      {
        appId: 1,
        id: 1,
        /** FAKENEW */
        status: VersionStatus.release,
        summary: '假数据',
      },
    ];
    return setPage(list, { current, size, total: 20 });
  });
