import { defineConfig } from '@rlx/far'
// import '@rlx/far-plugin-tai'
// import '@rlx/far-plugin-redis'

export default defineConfig({
  appname: '發',
  // plugins: [taiRoutesPlugin, redisPlugin],
  redis: {
    url: 'redis://localhost:6379'
  },
  tai: {
    apiDir: './src/apis',
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
