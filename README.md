# `@rlx/far` 「發」

> Far At Remote 面向未来「云函数」的轻量级 functional node 服务框架, powered by koa.

---

## 起步

```json
"scripts": {
  "::首次安装依赖": "yarn bootstrap",
  "::!!!不要cd到 packages/* 里面直接安装依赖": "DO NOT CD packages/* run yarn install",
  "::为root项目安装依赖<pkg>": "yarn add -W -D <pkg>",
  "::删除root项目的依赖<pkg>": "yarn remove -W -D <pkg>",
  "::为所有packages/*安装依赖<pkg>": "lerna add <pkg>",
  "::不好用;;删除所有packages/*的依赖<pkg>": "lerna remove <pkg>",
  "::为<pkgB>安装依赖<pkgA>": "yarn workspace <pkgB> add <pkgA>",
  "::删除<pkgB>的依赖<pkgA>": "yarn workspace pkgB remove pkgA",
  "::git commit 请使用下方命令": "yarn commit | npm run commit",
  "::发布": "learn publish",
  "bootstrap": "lerna bootstrap --use-workspaces",
  "commit": "git-cz",
  "clean": "yarn workspaces run clean",
  "build": "lerna run --stream --sort build",
  "start": "lerna run start --parallel",
  "dev": "lerna run dev --parallel",
  "test": "lerna run --stream --sort test"
}
```

## 示例项目 packages/example
### start

```bash
cd packages/example
# 启动 redis 和 mysql
docker-compose up -d
npm run dev
```

### debug
vscode debug [debug-far-example]

---
## 配置 FarConfig

```ts
import { defineConfig } from '@rlx/far'
import { plugin as taiRoutesPlugin } from '@rlx/far-plugin-tai'
import { plugin as redisPlugin } from '@rlx/far-plugin-redis'

export default defineConfig({
  /** 应用名称 **/
  appname: '發',
  /** 插件 **/
  plugins: [taiRoutesPlugin, redisPlugin],
  /** 插件: 钛路由配置 **/
  tai: {
    apiDir: './src/apis',
  },
  /** 内置插件: logger 配置 **/
  logger: {
    dir: 'logs'
  },
  /** 内置插件:  静态资源配置 **/
  public: {
    dir: './public'
  },
  /** 服务器地址与端口 **/
  server: {
    host: '127.0.0.1', // docker 中记得改成 0.0.0.0
    port: '8888',
    basePath: '',
  },
});
```

## 插件 Plugin

> 基于 koa middleware 的插件机制, koa 的 middleware 可以轻松接入

### 插件配置


```ts

type MiddlewareLike =
  | Middleware<Koa.DefaultState, Context>
  | Middleware<Koa.DefaultState, Context>[];

type AwaitedVoid = void | Promise<void>;

export interface FarPlugin {
  (
    /**
     * 插件配置, 通过
     * declare module '@rlx/far' {
     *   mypluginConfig: {
     *      some: string
     *   }
     * }
     * 这种形式来进行拓展属性配置
     * **/
    conf: FarConfig,
    other: {
      /** koa 应用实例 **/
      app: Koa;
      /** 路由 **/
      router: KoaRouter;
      /** logger **/
      logger: FarLogger;
    },
  ): MiddlewareLike | AwaitedVoid;
  /**
   * import { PLUGIN_PRIORITY  } from '@rlx/far'
   * 权重, 值越小中间件越靠前 默认值 0
   * @example
   * PLUGIN_PRIORITY.CORE
   * PLUGIN_PRIORITY.CORE - 1
   * PLUGIN_PRIORITY.CORE + 1
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  priority?: PLUGIN_PRIORITY | (number & {});
}

```

#### 如何使用现有的 koa 插件: koa-bodyparser 示例

> 这是一个内置插件, 所以类型拓展并没有通过 declar module 来写

```ts
import bodyParser from 'koa-bodyparser';
import { FarConfig } from '../config';
import { FarPlugin, PLUGIN_PRIORITY } from './index';

export type BodyParserPluginConfig = {
  bodyparser?: Parameters<typeof bodyParser>[0];
};

export const bodyParserPlugin: FarPlugin = (conf: FarConfig, { app }) => {
  /**
   * 方式一: 在这里使用 app.use 注册即可
   * 通常来讲, 这里可以理解成一次性的注册工作, 通常用于 数据库的初始化 之类的前置的一次性的工作
   **/
  app.use(bodyParser(conf.bodyparser));
  /**
   * 方式二: 这里是一个 标准的 koa middleware 使用格式, 支持返回 koa middleware 数组
   * 这里就是标准的 koa 中间件, 会在每次请求的时候都会路过, 经典的洋葱模型
   **/
  return (ctx, next) => {
    return bodyParser(conf.bodyparser)(ctx, next)
  }
  /** 当然上面这个可以简化这样写
   * return bodyParser(conf.bodyparser)
   **/
};

bodyParserPlugin.priority = PLUGIN_PRIORITY.CORE - 1;
```

---

## Hooks

> 感谢 als! 基本概念参考
> https://mp.weixin.qq.com/s/DIDQaJgQcVwsdnbjx7LN_w
> https://juejin.cn/post/6922582727375978510?share_token=d47c9752-537f-4688-8ef1-aa37f0eb8953#heading-9
> https://mp.weixin.qq.com/s/DIDQaJgQcVwsdnbjx7LN_w

### 语法参考 [@midway/hooks](https://midwayjs.org/docs/hooks_syntax)

> 把开源的, 变成自己的, 但是基于我们 functional 的尿性, 比这个东西要更简化一些

### 内置hooks

- **Memory Hooks**
 内存里的 hooks, `set/get/del` 都是同步操作, 数据存储在内存中, 会在每次请求结束之后清理调用, 在请求结束之后就无法获取到数据, 不需要自己制定缓存 `key`
  - `useRawMemory()` 这个函数签名略微复杂, 因为一般是作为插件内部封装, 应用中不常用
      ```ts
      export const useRawMemory = <K extends keyof StoreSpace, T = StoreSpace[K]>(
        namespace: K,
        initializer?: T | (() => T),
      ): [T, () => void]
      ```
  - `useCtx(key?: string) -> koa.Context` 不填参数返回 `koa.Context`, 可选字段为 `keyof Context` 可以指定返回 Context 指定对象
  - `useCookies` 返回 `Cookies`, 内部其实就是 useCtx('cookies'), 用于读取请求`cookie`, 设置返回`cookie` 这样的操作
  - `const [headers, setHeaders] = useHeaders()` 用于读取 请求 `headers` 和 设置返回值的 `headers`

- **Cache Hooks**
  数据存储在 redis 之类的缓存数据库中, `set/get/del` 都是异步操作, 用于存储用户信息, 鉴权信息之类, 需要自己指定缓存 `key` 比如 `userId`
  - useRawCache() 这个函数签名略微复杂, 因为一般是作为插件内部封装, 应用中不常用
    ```ts
    export const useRawCache = async <
      K extends keyof CacheSpace,
      CacheKey extends string,
      R = CacheSpace[K],
    >(
      namespace: K,
      key: CacheKey,
      initializer?: R | (() => R) | (() => Promise<R>),
      ttl?: number,
    ): Promise<R>
    ```


---

## 插件开发

## 约定
> 虽然, 当前插件需要手动 import 和 set (FarConfig.plugins 字段), 但为了后续自定义读取 package.json 加载插件, 约定如下

- 自定义插件导出变量名为 `plugin`, 同时设置为具名函数, 方便log
- 自定义`hooks` 导出变量名为 `hooks`


### 常用 interface

- FarConfig 用来拓展配置字段和类型, 示例: `packages/far-plugin-tai/plugin.ts`
    ```ts
    declare module '@rlx/far' {
      interface FarConfig {
        tai: {
          entry: string;
          apis?: TApis;
        };
      }
    }
    ```
- StoreSpace 用来自定义 `Memory Hooks` 类型, 示例: 暂无
    ```ts
    declare module '@rlx/far' {
      interface StoreSpace {
        some: {
          conf: string
        };
      }
    }
    ```
- CacheSpace 用来自定义 `Cache Hooks` 类型, 示例: 暂无
    ```ts
    declare module '@rlx/far' {
      interface CacheSpace {
        some: {
          conf: string
        };
      }
    }
    ```
