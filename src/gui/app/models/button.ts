import type { TFunction } from '../../../types';

export class Button {
  public handlers: TFunction<Promise<unknown>, [Event]>[] = [];

  constructor(public element: Element) {
    element.addEventListener('click', (event) => this.trigger(event));
  }

  public use(handler: TFunction<undefined, [Event]>) {
    this.handlers.push(async (event) => {
      this.element.classList.add('processed');

      try {
        await handler(event);
      } finally {
        this.element.classList.remove('processed');
      }
    });

    return this;
  }

  async trigger(event = new Event('manual')) {
    for (const handler of this.handlers) {
      await handler(event)
    }
  }

  static build(element: Element) {
    return new Button(element);
  }
}