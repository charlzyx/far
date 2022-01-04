#!/usr/bin/env ts-node

import { devServer } from '@rlx/far';
import config from './.farrc';
import * as apis from './src/apis';

const runner = async () => {
  devServer({
    ...config,
    tai: {
      ...config.tai,
      apis,
    },
  });
};

runner();
