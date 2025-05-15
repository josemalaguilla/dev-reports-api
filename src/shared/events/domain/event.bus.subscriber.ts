import { DomainEvent, DomainEventClass } from './domain.event';

export abstract class EventBusSubscriber<T extends DomainEvent> {
  abstract subscribedTo(): DomainEventClass[];
  abstract on(event: T): Promise<void>;
}
