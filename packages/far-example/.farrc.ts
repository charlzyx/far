import { defineConfig } from '@rlx/far'
import { plugin as taiRoutesPlugin } from '@rlx/far-plugin-tai'
import * as apis from './src/apis'

// import logx from './src/middleware/logx'

export default defineConfig({
  appname: 'far-example',
  apis,
  plugins: [taiRoutesPlugin],
  logger: {
    logDir: 'logs'
  },
  public: './public',
  server: {
    host: '127.0.0.1',
    port: '8888',
    basePath: '',
  },

});
