import { IncomingMessage, ServerResponse } from 'http';
import { parse as parseQueryString } from 'querystring';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { parse as parseUrl } from 'url';
import bodyParser from 'body-parser';
import _ from 'lodash';

import { IRequestContextIncoming } from './types';
import { TRequestPayloadType } from '../../types';
import { parseJsonSafe } from '../../../utils';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
});

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
});

const parseQuerySearch = (queryString: string): Record<string, unknown> =>
  Object.entries(parseQueryString(queryString)).reduce((acc, [key, value]) => {
    const valueAsJson = _.flatten([value]).map(arrValue => {
      const parsingArrayValueAsJsonResult = parseJsonSafe(arrValue ?? '');
      return parsingArrayValueAsJsonResult.status === 'OK' ? parsingArrayValueAsJsonResult.result : arrValue;
    });

    return _.set(acc, key, valueAsJson?.length === 1 ? valueAsJson[0] : valueAsJson);
  }, {});


export const extractPayloadType = (headers: IncomingMessage['headers']): TRequestPayloadType | null => {
  const contentTypeKey = Object.keys(headers).find((key) => key.toLowerCase() === 'content-type');
  const contextType = _.flatten([_.get(headers, contentTypeKey ?? '', '')]).join(',').toLowerCase();

  if (contextType.includes('application/json')) {
    return 'json'
  }
  if (contextType.includes('/xml')) {
    return 'xml'
  }

  return null;
}

export const parsePayload = (type: TRequestPayloadType, raw: string): object | undefined => {
  if (type === 'json') {
    const parsed = parseJsonSafe(raw);
    return parsed.status === 'OK' ? parsed.result : undefined;
  }
  if (type === 'xml') {
    return xmlParser.parse(raw) ?? undefined;
  }

  return undefined;
}

export const serializePayload = (type: TRequestPayloadType, payload: object | null): string => {
  if (type === 'json') {
    return JSON.stringify(payload);
  }
  if (type === 'xml') {
    return xmlBuilder.build(payload ?? {});
  }

  return '';
}

export const extractHttpIncommingContext = async (request: IncomingMessage): Promise<IRequestContextIncoming> => {
  const { pathname, query: rawQuery } = parseUrl(request.url ?? '');

  const type = extractPayloadType(request.headers) ?? 'plain';
  const query = parseQuerySearch(rawQuery ?? '');

  const headers = Object
    .entries(request.headers)
    .map(([name, values]) => [name.toLowerCase(), _.flatten([values]).map((value) => String(value)).sort().join(',')])
    .reduce((acc, [name, value]) => _.set(acc, name, value), {});

  const dataRaw = await new Promise<string | null>((resolve, reject) =>
    bodyParser.raw({ limit: '10mb', type: '*/*' })(request, new ServerResponse(request), (error) => {
      if (error) {
        return reject(error);
      }

      const body = _.get(request, 'body');
      return resolve(Buffer.isBuffer(body) ? body.toString() : null);
    })
  );

  const data = dataRaw ? parsePayload(type, dataRaw) : undefined;

  return {
    type,

    method: String(request.method ?? 'GET').toUpperCase(),
    path: pathname ?? '/',

    headers,
    query,

    data,
    dataRaw: dataRaw ?? undefined,
  };
}
