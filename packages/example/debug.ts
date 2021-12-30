#!/usr/bin/env ts-node

import { devServer } from '@rlx/far';
import config from './.farrc';

const runner = async () => {
  devServer(config);
};

runner();
