import merge from 'deepmerge';
import path from 'path';

import type { TLoggerLevel } from '../logger';
import type { PartialDeep } from '../types';

import { cast } from '../utils';

const checkIsTypeScriptRuntime = (): boolean => path.parse(__filename).ext === '.ts';
const getPathToRoot = (): string => path.resolve(__dirname, checkIsTypeScriptRuntime() ? '' : '../', '../../');

export class Config {
  public storage = merge({
    statics: {
      public: {
        dir: path.resolve(getPathToRoot(), 'public'),
      },
    },

    gui: {
      route: '/_mock/gui',
    },

    history: {
      limit: 100,
    },

    logger: {
      level: cast<TLoggerLevel>('D'),
    },
  }, JSON.parse(process.env['MOCK_CONFIG'] ?? '{}'));

  public get<K extends keyof Config['storage']>(key: K): Config['storage'][K] {
    return this.storage[key];
  }

  public merge(payload: PartialDeep<Config['storage']>): this {
    return Object.assign(this, { storage: merge(this.storage, payload) });
  }
}
