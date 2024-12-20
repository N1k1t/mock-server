import _ from 'lodash';

import {
  IExpectationSchema,
  LExpectationFlatOperator,
  TExpectationFlatOperator,
  IExpectationOperatorContext,
  TExpectationOperatorLocation,
} from './types';

type TBaseExtractedContext = { parent: object, key: string };
type TExtractedContext =
  | (TBaseExtractedContext & { value?: unknown, type: 'object' })
  | (TBaseExtractedContext & { value?: string, type: 'string' })
  | (TBaseExtractedContext & { value?: number, type: 'number' });

export const checkIsLocationInContext = (
  location: TExpectationOperatorLocation,
  context: IExpectationOperatorContext<any>
): boolean => {
  switch(location) {
    case 'delay':
    case 'error':
    case 'method':
    case 'path': return _.has(context.incoming, location);

    default: return _.has(context, location);
  }
}

export const extractContextByLocation = (
  location: TExpectationOperatorLocation,
  context: IExpectationOperatorContext<any>
): TExtractedContext | null => {
  switch(location) {
    case 'path': return {
      key: 'incoming.path',
      type: 'string',
      parent: context,
      value: context.incoming?.path,
    };

    case 'method': return {
      key: 'incoming.method',
      type: 'string',
      parent: context,
      value: context.incoming?.method,
    };

    case 'incoming.body': return {
      key: 'incoming.body',
      type: 'object',
      parent: context,
      value: context.incoming?.body,
    };

    case 'incoming.bodyRaw': return {
      key: 'incoming.bodyRaw',
      type: 'string',
      parent: context,
      value: context.incoming?.bodyRaw,
    };

    case 'incoming.query': return {
      key: 'incoming.query',
      type: 'object',
      parent: context,
      value: context.incoming?.query,
    };

    case 'incoming.headers': return {
      key: 'incoming.headers',
      type: 'object',
      parent: context,
      value: context.incoming?.headers,
    };

    case 'outgoing.data': return {
      key: 'outgoing.data',
      type: 'object',
      parent: context,
      value: context.outgoing?.data,
    };

    case 'outgoing.dataRaw': return {
      key: 'outgoing.dataRaw',
      type: 'string',
      parent: context,
      value: context.outgoing?.dataRaw,
    };

    case 'outgoing.headers': return {
      key: 'outgoing.headers',
      type: 'object',
      parent: context,
      value: context.outgoing?.headers,
    };

    case 'outgoing.status': return {
      key: 'outgoing.status',
      type: 'number',
      parent: context,
      value: context.outgoing?.status,
    };

    case 'delay': return {
      key: 'incoming.delay',
      type: 'number',
      parent: context,
      value: context.incoming?.delay,
    };

    case 'error': return {
      key: 'incoming.error',
      type: 'string',
      parent: context,
      value: context.incoming?.error,
    };

    case 'seed': return {
      key: 'seed',
      type: 'number',
      parent: context,
      value: context.seed,
    };

    case 'state': return {
      key: 'state',
      type: 'object',
      parent: context,
      value: context.state,
    };

    case 'cache': return {
      key: 'cache',
      type: 'object',
      parent: context,
      value: context.cache,
    };

    case 'container': return {
      key: 'container',
      type: 'object',
      parent: context,
      value: context.container,
    }

    default: return null;
  }
}

export const introspectExpectationOperatorsSchema = <T extends object = IExpectationSchema, K extends keyof T = keyof T>(
  schema: T,
  handler: (key: K, schema: T, path: string) => unknown,
  location: string = ''
): void => {
  (<K[]>Object.keys(schema)).forEach((key) => {
    const path = location ? `${location}.${String(key)}` : String(key);

    handler(key, schema, path);

    if (_.isObject(schema[key]) && !LExpectationFlatOperator.includes(<TExpectationFlatOperator>key)) {
      introspectExpectationOperatorsSchema(<T>schema[key], handler, path);
    }
  });
}
