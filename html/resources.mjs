
const cachedPrakim = {};


export function getPerkMp3Name(perk) {
  return `./mp3/${perk.toString().padStart(3, '0')}.mp3`;
}

export function getPerkDataName(perk) {
  return `./prakim/${perk.toString().padStart(3, '0')}.json`;
}

export async function getPerkDuration(perk) {
  const d = await loadPerkData(perk)
  return d.duration;
}

export async function loadPerkData(perk) {
  if (!cachedPrakim[perk]) {
    cachedPrakim[perk] = (await fetch(getPerkDataName(perk))).json()
  }
  return cachedPrakim[perk];
}
