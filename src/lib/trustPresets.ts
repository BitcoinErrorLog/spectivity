import { getAllTrustPresets, getTrustPreset } from '@/data/adapters'
import type { TrustPreset } from '@/data/types'

export function getDefaultPreset(): TrustPreset {
  return getTrustPreset('preset-all')!
}

export function resolvePreset(presetId: string): string[] {
  const preset = getTrustPreset(presetId)
  if (!preset) return getAllTrustPresets()[0].includedReviewers
  return preset.includedReviewers
}

export { getAllTrustPresets, getTrustPreset }
