import _ from 'lodash';

import {
  extractPayloadType,
  HttpRequestContext,
  IRequestContextIncoming,
  IRequestContextOutgoing,
  Middleware,
  serializePayload,
} from '../models';

const buildEmptyOutgoing = (incoming: IRequestContextIncoming): IRequestContextOutgoing => ({
  type: incoming.type,
  status: 200,

  data: incoming.type === 'plain' ? '' : {},
  dataRaw: '',

  headers: {
    'content-type': incoming.type === 'json'
      ? 'application/json'
      : incoming.type === 'xml'
      ? 'application/xml'
      : incoming.headers['content-type'] ?? 'text/plain',
  },
});

export default Middleware
  .build(__dirname, ['history', 'expectation'])
  .assignHandler((context) => {
    const plain = context.toPlain({ locations: ['incoming', 'forwarded.outgoing'], clone: true });
    const manipulated = context.shared.expectation.response?.manipulate({
      ...plain,
      outgoing: plain.forwarded?.outgoing ?? buildEmptyOutgoing(context.incoming),
    });

    const outgoing = manipulated?.outgoing ?? plain.forwarded?.outgoing ?? buildEmptyOutgoing(context.incoming);
    const type = extractPayloadType(outgoing.headers);

    const data = outgoing.data === undefined ? outgoing.dataRaw : outgoing.data;
    const dataRaw = Buffer.from(typeof data === 'object' ? serializePayload(type, data) : String(data));

    Object.assign(outgoing, {
      type,
      dataRaw,

      headers: Object.assign(outgoing.headers, {
        ...((!outgoing.headers?.['transfer-encoding'] && !context.request.headers['transfer-encoding']) && {
          'content-length': String(dataRaw.length),
        }),
      })
    });

    context.response.writeHead(outgoing.status ?? 200, outgoing.headers);
    context.response.write(outgoing.dataRaw);
    context.response.end();

    context.shared.history.assignOutgoing(outgoing).changeState('finished');
    context.server.exchange.ws.publish('history:updated', context.shared.history.toPlain());
  });