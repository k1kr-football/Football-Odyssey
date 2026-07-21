import { dynamicEvents } from './dynamic';
import { EventDefinition } from './manager';
import { managerEvents } from './manager';
import { teammateEvents } from './teammates';
import { agentEvents } from './agent';
import { mediaEvents } from './media';

export const ALL_EVENTS: EventDefinition[] = [
  ...managerEvents,
  ...teammateEvents,
  ...agentEvents,
  ...mediaEvents,
  ...dynamicEvents
];
