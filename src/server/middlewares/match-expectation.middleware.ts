import _ from 'lodash';
import { Middleware } from '../models';

export default Middleware
  .build(__filename)
  .assignHandler((context, { logger }) => {
    const plain = context.toPlain({ locations: ['incoming'] });
    const expectation = context.server.storage.expectations.match<any>('request', plain);

    if (!expectation) {
      const history = context.server.storage.history
        .register(plain)
        .changeState('finished');

      context.server.exchange.ws.publish('history:added', history.toPlain());
      return context.reply.notFound();
    }

    logger.info('Has matched with', `"${expectation.name}" [${expectation.id}]`);

    expectation.increaseExecutionsCounter();

    context.server.exchange.ws.publish('expectation:updated', expectation.toPlain());
    context.share({ expectation });
  });
