import path from 'node:path'
import {mkdirSync} from 'node:fs'

export const BASE_PATH = '/Users/ari.glasser/workspace/thilim_back/' ?? process.cwd()
export const MP3_SOURCE_BASE_URI = `https://vedibarta.org/tehi/`

export const DESTINATION_DIRECTORY = path.join(BASE_PATH,'mp3')

export const perkName = (perk) => `${perk.toString().padStart(3, '0')}`
export const perkMp3Name = (perk) => `${perkName(perk)}.mp3`

export const perkDownloadUri = (perk) => `${MP3_SOURCE_BASE_URI}p${perkMp3Name(perk)}`

export const perkFileName = (perk) => path.join(DESTINATION_DIRECTORY,perkMp3Name(perk));

mkdirSync(DESTINATION_DIRECTORY, { recursive: true });
