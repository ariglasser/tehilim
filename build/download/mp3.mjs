import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import {perkDownloadUri,perkFileName} from '../common/index.mjs'


async function downloadMP3(uri, destination) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to fetch '${uri}' (${response.status})`);
  }
  await pipeline(response.body, fs.createWriteStream(destination));
  return destination
}

async function downloadPerk(perk){
  const destination = perkFileName(perk)
  if (!fs.existsSync(destination)) {
    const perkUri = perkDownloadUri(perk)
    return downloadMP3(perkUri, destination)
  }
}

async function downloadPrakim(from,to){
  const downloaded =
    Array.from({ length: to - from + 1 }, (a_, i) =>  (i+from))
      .map(downloadPerk)
  const response = await Promise.all(downloaded);
  console.log(response.filter(Boolean))
  return response
}

let i = 0;
while (i<150) {
  i = i + 10
  console.log(`Downloading ${1} to ${i}`)
  await downloadPrakim(1, i);
}
