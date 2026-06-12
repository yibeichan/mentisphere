import regions from '../../../data/metadata/regions.json'
import type { BrainRegion } from '@/types/brain'

export const brainRegions = regions as BrainRegion[]
export const regionById = new Map(brainRegions.map((region) => [region.id, region]))
