import { Expectation } from '../../expectations';
import { prepareExpectationBodyToRequest } from '../utils';
import { Client } from './client';

interface IExpectationContext {
  incoming: {
    query: {
      foo?: 'a' | 'b' | 'c';
      bar: 'a' | 'b' | 'c';
    }

    body: {
      foo: 'a' | 'b' | 'c';
      bar?: ('a' | 'b' | 'c')[];

      baz: {
        foo: 1 | 2 | 3;
        bar?: 1 | 2 | 3;
        baz?: (1 | 2 | 3)[];
      };
    };
  };
}

const buildClient = () => new Client({
  ping: () => Promise.resolve('pong'),
  deleteExpectations: () => Promise.resolve(null),

  createExpectation: (configuration) => Promise.resolve(
    prepareExpectationBodyToRequest(
      Object.assign(Expectation.build(configuration).toPlain(), {
        id: '12426262-85a3-4340-969b-272e003722e9',
        name: 'MaliciousCobra',
      })
    )
  ),

  updateExpectation: ({ id, set }) => Promise.resolve(
    prepareExpectationBodyToRequest(
      Object.assign(Expectation.build({ ...set, schema: set.schema ?? {} }).toPlain(), { id })
    )
  ),
});

describe('Client.Models.Client', () => {
  it('should create expectation with complex schema as object', async () => {
    const client = buildClient();

    await expect(
      client.createExpectation({
        schema: {
          request: {
            $and: [
              { $has: { $location: 'path', $value: '/foo' } },
              { $has: { $location: 'path', $valueAnyOf: ['/foo', '/foo/bar'] } },
              { $has: { $location: 'path', $match: '/foo/*' } },
              { $has: { $location: 'path', $matchAnyOf: ['/foo/*', '*/bar'] } },
              { $has: { $location: 'path', $regExp: /^\/foo/ } },
              { $has: { $location: 'path', $regExpAnyOf: [/^\/foo$/, /^\/foo\/bar$/] } },
              { $has: { $location: 'path', $exec: (payload) => payload.includes('/foo') } },

              { $has: { $location: 'path', $path: '/foo', $value: '/foo' } },
              { $has: { $location: 'path', $path: '/foo', $valueAnyOf: ['/foo', '/foo/bar'] } },
              { $has: { $location: 'path', $path: '/foo', $match: '/foo/*' } },
              { $has: { $location: 'path', $path: '/foo', $matchAnyOf: ['/foo/*', '*/bar'] } },
              { $has: { $location: 'path', $path: '/foo', $regExp: /^\/foo/ } },
              { $has: { $location: 'path', $path: '/foo', $regExpAnyOf: [/^\/foo$/, /^\/foo\/bar$/] } },
              { $has: { $location: 'path', $path: '/foo', $exec: (payload) => payload.includes('/foo') } },

              { $has: { $location: 'incoming.query' } },

              { $has: { $location: 'incoming.query', $value: { foo: 'a' } } },
              { $has: { $location: 'incoming.query', $valueAnyOf: [{ foo: 'a' }, { foo: 'b' }] } },
              { $has: { $location: 'incoming.query', $match: { foo: 'a' } } },
              { $has: { $location: 'incoming.query', $matchAnyOf: [{ foo: 'a' }, { foo: 'b' }] } },
              { $has: { $location: 'incoming.query', $exec: (payload, { T }) => T(payload)?.foo === 'a' } },

              { $has: { $location: 'incoming.query', $path: 'foo', $value: 'a' } },
              { $has: { $location: 'incoming.query', $path: 'foo', $valueAnyOf: ['a', 'b'] } },
              { $has: { $location: 'incoming.query', $path: 'foo', $match: 'a' } },
              { $has: { $location: 'incoming.query', $path: 'foo', $matchAnyOf: ['a', 'b'] } },
              { $has: { $location: 'incoming.query', $path: 'foo', $regExp: /a|b/ } },
              { $has: { $location: 'incoming.query', $path: 'foo', $regExpAnyOf: [/a/i, /b/i] } },
              { $has: { $location: 'incoming.query', $path: 'foo', $exec: (payload) => payload === 'a' } },

              { $has: { $location: 'incoming.body' } },

              { $has: { $location: 'incoming.body', $value: { foo: 'a', bar: ['a'] } } },
              { $has: { $location: 'incoming.body', $valueAnyOf: [{ foo: 'a', bar: ['a'] }, { bar: ['b'] }, { baz: {} }] } },
              { $has: { $location: 'incoming.body', $match: { foo: 'a', baz: { foo: 1 } } } },
              { $has: { $location: 'incoming.body', $matchAnyOf: [{ baz: {} }, { bar: [] }] } },
              { $has: { $location: 'incoming.body', $exec: (payload, { T }) => T(payload)?.baz?.foo === 1 } },

              { $has: { $location: 'incoming.body', $path: 'baz', $value: { foo: 1, bar: 1 } } },
              { $has: { $location: 'incoming.body', $path: 'baz', $valueAnyOf: [{ foo: 1 }, { bar: 1 }] } },
              { $has: { $location: 'incoming.body', $path: 'baz', $match: { foo: 1 } } },
              { $has: { $location: 'incoming.body', $path: 'baz', $matchAnyOf: [{}, { foo: '1' }] } },
              { $has: { $location: 'incoming.body', $path: 'baz', $exec: (payload, { T }) => T(payload)?.foo === 1 } },

              { $has: { $location: 'incoming.body', $path: 'baz.baz', $value: [1] } },
              { $has: { $location: 'incoming.body', $path: 'baz.baz', $valueAnyOf: [[1], [1, 2]] } },
              { $has: { $location: 'incoming.body', $path: 'baz.baz', $match: '*' } },
              { $has: { $location: 'incoming.body', $path: 'baz.baz', $matchAnyOf: ['1', '2'] } },
              { $has: { $location: 'incoming.body', $path: 'baz.baz', $regExp: /1/ } },
              { $has: { $location: 'incoming.body', $path: 'baz.baz', $regExpAnyOf: [/1/, /2/] } },
              { $has: { $location: 'incoming.body', $path: 'baz.baz', $exec: (payload) => payload === 1 } },
            ],
          },

          response: {
            $or: [
              {
                $switch: {
                  $location: 'outgoing.status',
                  $cases: {
                    200: {
                      $and: [
                        { $set: { $location: 'outgoing.data', $value: {} } },
                        { $set: { $location: 'outgoing.data', $path: 'foo', $value: 'a' } },

                        { $set: { $location: 'outgoing.headers', $exec: () => ({}) } },
                        { $set: { $location: 'outgoing.headers', $path: 'foo', $value: 'bar' } },
                      ],
                    },
                  },

                  $default: { $set: { $location: 'outgoing.data', $value: {} } },
                },
              },
              {
                $switch: {
                  $location: 'outgoing.data',
                  $path: 'baz.bar',

                  $cases: {
                    1: {
                      $and: [
                        { $merge: { $location: 'outgoing.data', $value: {} } },
                        { $remove: { $location: 'outgoing.data', $path: 'foo' } },
                      ],
                    },
                  },
                },
              },
              {
                $switch: {
                  $location: 'outgoing.headers',
                  $exec: (payload) => payload.foo,

                  $cases: {
                    'a': {
                      $and: [{
                        $exec: ({ context }) => {
                          if (context.incoming.body?.foo === 'a') {
                            context.outgoing!.status = 200;
                          }
                        },
                      }],
                    },
                  },
                },
              },
            ],
          },
        },
      })
    ).resolves.toMatchSnapshot();
  });

  it('should create expectation with complex schema as function', async () => {
    const client = buildClient();

    await expect(
      client.createExpectation<IExpectationContext>(({ $ }) => ({
        schema: {
          request: $.and([
            $.has('path', { $value: '/foo' }),
            $.has('path', { $valueAnyOf: ['/foo', '/foo/bar'] }),
            $.has('path', { $match: '/foo/*' }),
            $.has('path', { $matchAnyOf: ['/foo/*', '*/bar'] }),
            $.has('path', { $regExp: /^\/foo/ }),
            $.has('path', { $regExpAnyOf: [/^\/foo$/, /^\/foo\/bar$/] }),
            $.has('path', { $exec: (payload) => payload.includes('/foo') }),

            $.has('path', '$path', '/foo', { $value: '/foo' }),
            $.has('path', '$path', '/foo', { $valueAnyOf: ['/foo', '/foo/bar'] }),
            $.has('path', '$path', '/foo', { $match: '/foo/*' }),
            $.has('path', '$path', '/foo', { $matchAnyOf: ['/foo/*', '*/bar'] }),
            $.has('path', '$path', '/foo', { $regExp: /^\/foo/ }),
            $.has('path', '$path', '/foo', { $regExpAnyOf: [/^\/foo$/, /^\/foo\/bar$/] }),
            $.has('path', '$path', '/foo', { $exec: (payload) => payload.includes('/foo') }),

            $.has('incoming.query', {}),
            $.has('incoming.query', '$path', 'foo'),

            $.has('incoming.query', { $value: { foo: 'a', bar: 'a' } }),
            $.has('incoming.query', { $valueAnyOf: [{ foo: 'a', bar: 'a' }, { foo: 'b', bar: 'b' }] }),
            $.has('incoming.query', { $match: { foo: 'a' } }),
            $.has('incoming.query', { $matchAnyOf: [{ foo: 'a' }, { foo: 'b' }] }),
            $.has('incoming.query', { $exec: (payload) => payload?.foo === 'a' }),

            $.has('incoming.query', '$path', 'foo', { $value: 'a' }),
            $.has('incoming.query', '$path', 'foo', { $valueAnyOf: ['a', 'b'] }),
            $.has('incoming.query', '$path', 'foo', { $match: 'a' }),
            $.has('incoming.query', '$path', 'foo', { $matchAnyOf: ['a', 'b'] }),
            $.has('incoming.query', '$path', 'foo', { $regExp: /a|b/ }),
            $.has('incoming.query', '$path', 'foo', { $regExpAnyOf: [/a/i, /b/i] }),
            $.has('incoming.query', '$path', 'foo', { $exec: (payload) => payload === 'a' }),

            $.has('incoming.body', {}),

            $.has('incoming.body', { $value: { foo: 'a', bar: ['a'] } }),
            $.has('incoming.body', { $valueAnyOf: [{ foo: 'a', bar: ['a'] }, { bar: ['b'] }, { baz: {} }] }),
            $.has('incoming.body', { $match: { foo: 'a', baz: { foo: 1 } } }),
            $.has('incoming.body', { $matchAnyOf: [{ baz: {} }, { bar: [] }] }),
            $.has('incoming.body', { $exec: (payload) => payload?.baz?.foo === 1 }),

            $.has('incoming.body', '$path', 'baz', { $value: { foo: 1, bar: 1 } }),
            $.has('incoming.body', '$path', 'baz', { $valueAnyOf: [{ foo: 1 }, { foo: 1, bar: 1 }] }),
            $.has('incoming.body', '$path', 'baz', { $match: { foo: 1 } }),
            $.has('incoming.body', '$path', 'baz', { $matchAnyOf: [{}, { foo: 1 }] }),
            $.has('incoming.body', '$path', 'baz', { $exec: (payload) => payload?.foo === 1 }),

            $.has('incoming.body', '$jsonPath', '123.123.213', {
              $match: {},
            }),

            $.has('incoming.body', '$path', 'baz.baz', { $value: [1] }),
            $.has('incoming.body', '$path', 'baz.baz', { $valueAnyOf: [[1], [1, 2]] }),
            $.has('incoming.body', '$path', 'baz.baz.0', { $match: '*' }),
            $.has('incoming.body', '$path', 'baz.baz.0', { $matchAnyOf: ['1', '2'] }),
            $.has('incoming.body', '$path', 'baz.baz', { $regExp: /1/ }),
            $.has('incoming.body', '$path', 'baz.baz', { $regExpAnyOf: [/1/, /2/] }),
            $.has('incoming.body', '$path', 'baz.baz', { $exec: (payload) => payload?.[0] === 1 }),

            $.switch('incoming.query', '$path', 'foo', {
              $cases: {
                'a': $.and([])
              },
            }),
          ]),

          response: $.or([
            $.switch('outgoing.status', {
              $cases: {
                200: $.and([
                  $.set('outgoing.data', { $value: {} }),
                  $.set('outgoing.data', '$path', 'foo', { $value: 'a' }),
                  $.set('outgoing.headers', { $exec: () => ({}) }),
                  $.set('outgoing.headers', '$path', 'foo', { $value: 'bar' }),
                ]),
              },

              $default: $.set('outgoing.data', { $value: {} }),
            }),

            $.switch('incoming.body', '$path', 'baz.bar', {
              $cases: {
                1: $.and([
                  $.merge('outgoing.data', { $value: {} }),
                  $.remove('outgoing.data', '$path', 'foo'),
                ]),
              },
            }),

            $.switch('incoming.body', '$exec', (payload) => payload.baz.bar, {
              $cases: {
                1: $.and([]),
              },
            }),

            $.switch('outgoing.headers', '$exec', (payload) => payload.foo, {
              $cases: {
                'a': $.and([
                  $.exec(({ context }) => {
                    if (context.incoming.body.foo === 'a') {
                      context.outgoing!.status = 200;
                    }
                  }),
                ]),
              },
            }),
          ]),
        },
      }))
    ).resolves.toMatchSnapshot();
  });
});
