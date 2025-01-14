import type { InternalHttpRequestContext, InternalSocketIoRequestContext } from '../transports';
import type { SetRequiredKeys, TFunction } from '../../types';

export interface IEndpointResponse<T> {
  status: 'OK' | 'INTERNAL_ERROR' | 'VALIDATION_ERROR' | 'NOT_FOUND';
  data: T;
}

export interface IEndpointInput {
  incoming?: {
    query?: any;
    data?: any;
  };

  outgoing?: any;
}

export interface IEndpointSchema<TInput extends IEndpointInput> {
  incoming: SetRequiredKeys<{
    data?: NonNullable<TInput['incoming']>['data'];
    query?: NonNullable<TInput['incoming']>['query'];
  }, Extract<keyof NonNullable<TInput['incoming']>, 'query' | 'data'>>;

  outgoing: IEndpointResponse<TInput['outgoing']>;
}

export class Endpoint<
  TInput extends IEndpointInput = {},
  TSchema extends IEndpointSchema<TInput> = IEndpointSchema<TInput>
> {
  public TSchema!: TSchema;
  public TCompiled!: SetRequiredKeys<Endpoint<TInput, TSchema>, 'handler'>;

  public handler?: TFunction<any, [
    (InternalHttpRequestContext<TSchema['outgoing']['data']> | InternalSocketIoRequestContext<TSchema['outgoing']['data']>) & {
      incoming: TSchema['incoming'];
    }
  ]>;

  public http?: {
    method: string;
    path: string;
  };

  public io?: {
    path: string;
  };

  public bindToHttp<This extends NonNullable<Endpoint<TInput, TSchema>['http']>>(http: This) {
    return Object.assign(this, { http });
  }

  public bindToIo<Q extends NonNullable<Endpoint<TInput, TSchema>['io']>>(io: Q) {
    return Object.assign(this, { io });
  }

  public assignHandler<Q extends NonNullable<Endpoint<TInput, TSchema>['handler']>>(handler: Q) {
    return Object.assign(this, { handler });
  }

  public compile<This extends Endpoint<TInput, TSchema>['TCompiled']>(this: This) {
    return this;
  }

  static build<
    TInput extends IEndpointInput = {},
    TSchema extends IEndpointSchema<TInput> = IEndpointSchema<TInput>
  >() {
    return new Endpoint<TInput, TSchema>();
  }
}
