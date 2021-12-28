import { defineConfig } from '@rlx/far'
import * as apis from './src/apis'

// import logx from './src/middleware/logx'

export default defineConfig({
  apis,
  public: './public',
  server: {
    host: '127.0.0.1',
    port: '8888',
    basePath: '',
  },

});
