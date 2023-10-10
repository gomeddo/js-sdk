export default class TimeSlotConfiguration {
  slotDuration: number
  slotBoundary: number
  slotSpacing: number
  start: Date | null
  end: Date | null

  constructor (config: {
    slotDuration: number
    slotBoundary?: number
    slotSpacing?: number
    start?: Date
    end?: Date
  }) {
    this.slotDuration = config.slotDuration
    this.slotBoundary = config.slotBoundary ?? 0
    this.slotSpacing = config.slotSpacing ?? this.slotDuration
    this.start = config.start ?? null
    this.end = config.end ?? null
  }
}
