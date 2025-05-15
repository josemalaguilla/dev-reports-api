import { EventBus } from '../../../../../src/shared/events/domain/event.bus';

export class EventBusMock implements EventBus {
  publish = jest.fn();
}
