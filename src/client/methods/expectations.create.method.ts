import { handleRequestError, prepareExpectationBodyToRequest } from '../utils';
import { ValidationError } from '../errors';
import { ClientMethod } from '../models';
import { TEndpoints } from '../types';
import { cast } from '../../utils';

import config from '../../config';

export default ClientMethod
  .build<{
    incoming: TEndpoints['createExpectation']['incoming']['data'];
    outgoing: TEndpoints['createExpectation']['outgoing']['data'];
  }>()
  .register('remote', (instance) => async (body) => {
    const response = await instance
      .request<TEndpoints['createExpectation']['outgoing']>({
        data: prepareExpectationBodyToRequest(body),

        ...cast<TEndpoints['createExpectation']['location']>({
          url: `${config.get('routes').internal.root}/expectations`,
          method: 'POST',
        }),
      })
      .catch(handleRequestError);

    return response.data.data;
  })
  .register('onsite', (provider) => async (body) => {
    const result = provider.storages.expectations.register(Object.assign(body, {
      group: provider.group,
    }));

    if (result.status === 'ERROR') {
      throw new ValidationError({}, result.reasons);
    }

    provider.exchanges.io.publish('expectation:added', result.expectation.toPlain());
    return result.expectation.toPlain();
  });
