
const cachedPerkHTMLs = {};


export function getPerkMp3Name(perk) {
  return `./mp3/${perk.toString().padStart(3, '0')}.mp3`;
}

export function getPerkDataName(perk) {
  return `./prakim/${perk.toString().padStart(3, '0')}.json`;
}

export function getPerkDuration(perk) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(getPerkMp3Name(perk));
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
    });

    audio.addEventListener('error', (e)=>{
      console.error(`error loading ${perk}`,e)
      reject(e)
    });
    audio.load();  // Trigger loading of the audio file
  });
}

export async function loadPerkData(perk) {
  if (!cachedPerkHTMLs[perk]) {
    cachedPerkHTMLs[perk] = (await fetch(getPerkDataName(perk))).json()
  }
  return cachedPerkHTMLs[perk];
}
