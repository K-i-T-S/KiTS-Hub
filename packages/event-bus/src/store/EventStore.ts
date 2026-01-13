import type { EventStore as IEventStore, BaseEvent } from '../types';

export abstract class EventStore implements IEventStore {
  abstract save(event: BaseEvent): Promise<void>;
  abstract getEvents(filter?: {
    type?: string;
    source?: string;
    fromDate?: Date;
    toDate?: Date;
    correlationId?: string;
  }): Promise<BaseEvent[]>;
  abstract getEvent(id: string): Promise<BaseEvent | null>;
}
