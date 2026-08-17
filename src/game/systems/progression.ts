export const STORY_LAYERS = [
  'identity',
  'other_girl',
  'friendship',
  'window_0317',
  'truth',
] as const

export type StoryLayer = (typeof STORY_LAYERS)[number]

export function hasLayer(
  flags: Record<string, boolean>,
  layer: StoryLayer,
): boolean {
  return Boolean(flags[layer])
}
