import { useRawMemory } from '../hooks';
import { FarPlugin, PLUGIN_PRIORITY } from './index';

export const memoHooksPlugin: FarPlugin = () => {
  return async (ctx, next) => {
    const [, clear] = useRawMemory('ctx', ctx);
    await next();
    clear();
  };
};

memoHooksPlugin.priority = PLUGIN_PRIORITY.CORE - 1;
