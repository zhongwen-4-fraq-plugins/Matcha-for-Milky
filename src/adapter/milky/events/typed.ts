/* eslint-disable camelcase */
import type { Event as BaseEvent } from '~/adapter/event'

export interface MilkyEvent extends BaseEvent {
  event_type: string
  time: number
  self_id: number
  data: Record<string, unknown>
}

export function createEvent(
  scene: { time: number, self_id: string },
  eventType: string,
  data: Record<string, unknown>,
): MilkyEvent {
  return {
    event_type: eventType,
    time: scene.time,
    self_id: Number(scene.self_id),
    data,
  }
}
