import { History } from './model';
import config from '../../config';

export class HistoryStorage extends Map<string, History> {
  private idsStack: string[] = [];

  public register(request: History['request']): History {
    const historyRecord = History.build(request);

    this.set(historyRecord.id, historyRecord);

    if (this.idsStack.push(historyRecord.id) > config.server.historyRecordsLimit) {
      this.delete(this.idsStack.shift()!);
    }

    return historyRecord;
  }
}