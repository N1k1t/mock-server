import type { TFunction } from '../types';
import type { Config } from '../config';

import type * as endpoints from '../server/endpoints';
import type * as methods from './methods';

export interface IRemoteClientConnectOptions {
  host: string;
  port: number;
  timeout?: number;
}

export type TMethodsSchema = {
  [K in keyof typeof methods]: TFunction<
    Promise<typeof methods[K]['TSchema']['outgoing']>, [typeof methods[K]['TSchema']['incoming']]
  >;
};

export type TEndpoints = {
  [K in keyof typeof endpoints]: {
    http: (typeof endpoints)[K]['http'];
    io: (typeof endpoints)[K]['io'];

    incoming: (typeof endpoints)[K]['TSchema']['incoming'];
    outgoing: (typeof endpoints)[K]['TSchema']['outgoing'];

    location: {
      url: `${Config['storage']['routes']['internal']['root']}${(typeof endpoints)[K]['http']['path']}`;
      method: (typeof endpoints)[K]['http']['method'];
    };
  };
}
