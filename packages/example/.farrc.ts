import { defineConfig } from '@rlx/far'
import { plugin as taiRoutesPlugin } from '@rlx/far-plugin-tai'
import { plugin as redisPlugin } from '@rlx/far-plugin-redis'
// import * as apis from './src/apis'

// import logx from './src/middleware/logx'

export default defineConfig({
  appname: '發',
  plugins: [taiRoutesPlugin, redisPlugin],
  redis: {
    url: 'redis://localhost:6379'
  },
  tai: {
    // apis,
    entry: './src/apis',
  },
  logger: {
    dir: 'logs'
  },
  public: {
    dir: './public'
  },
  server: {
    host: '127.0.0.1',
    port: '8888',
    basePath: '',
  },

});
