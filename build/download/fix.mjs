import fs from 'node:fs'
import {perkName} from '../common/index.mjs'

const DURATIONS = [46.706939,72.777143,55.013878,60.186122,88.946939,69.172245,110.785306,62.119184,123.454694,112.091429,47.960816,54.648163,41.795918,49.658776,35.73551,64.809796,97.332245,277.603265,96.679184,57.077551,73.769796,170.083265,41.116735,57.861224,110.759184,58.88,97.227755,67.422041,66.45551,71.57551,149.629388,72.202449,107.807347,118.909388,182.804898,78.315102,212.009796,122.070204,88.946939,129.985306,80.300408,89.913469,46.262857,135.549388,119.875918,72.803265,59.219592,80.561633,102.817959,114.599184,110.419592,64.835918,51.173878,48.013061,128.287347,77.453061,80.875102,66.847347,116.558367,82.494694,53.629388,80.74449,71.810612,63.712653,97.776327,103.732245,49.031837,236.643265,194.925714,39.314286,139.258776,107.467755,121.443265,126.981224,59.219592,68.832653,121.547755,361.299592,108.956735,118.334694,94.850612,45.87102,95.555918,78.001633,72.724898,118.93551,47.621224,105.221224,280.241633,100.127347,82.573061,105.926531,41.012245,122.174694,63.869388,70.034286,59.872653,61.257143,56.32,27.977143,54.151837,154.697143,121.103673,216.842449,188.525714,263.131429,249.208163,63.294694,143.098776,52.793469,58.488163,49.946122,38.635102,32.653061,83.957551,104.437551,21.315918,153.260408,783.751837,35.448163,42.971429,62.328163,32.548571,44.251429,40.019592,41.952653,39.000816,38.29551,39.915102,47.307755,24.920816,96.626939,29.152653,23.562449,109.583673,101.276735,62.354286,55.562449,139.023673,87.301224,73.795918,72.019592,111.46449,105.534694,114.468571,60.05551,107.546122,88.502857,53.289796,110.654694]
function load(perk) {
  const fileName = perkName(perk)
  return JSON.parse(fs.readFileSync(`../../html/prakim/${fileName}.json`).toString())
}

function save(fileName, data) {
  const filePath = `../../html/prakim/${fileName}.json`;
  console.log("writing",filePath)
  return fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function extract(htmlString) {
  return htmlString.replace(/<\/?[^>]+(>|$)/g, ''); // Removes all HTML tags
}

function fix(verses) {
  let totalWordCount = 0;
  let r = verses
    .map(l => l.trim());
  r = r
    .filter(l => !l.startsWith('<a '))
    .filter(l => !l.startsWith('<br>'));
  r = r
    .map(l => l.split('&nbsp;').filter(t=>t.length).join(' '))

  const lines = []
  const addLine = (verse, texts) => {
    if (!verse && !texts?.length) {
      return
    }
    if (verse.includes('-')) {
      const verses = verse.split('-');
      if (texts.length === verses.length) {
        verses.forEach((v, i) => {
          addLine(v, [texts[i]])
        })
        return;
      } else {
        throw new Error('mismatch')
      }

    }
    if (verse && texts.length) {
      let text = texts.join(' ').trim();
      if (text.endsWith('׃')){
        text = text.slice(0, -1);
      }
      if (text.includes('׃')){
        throw new Error('colon')
      }
      const worCount = text.split(' ').filter(w=>w.trim().length>0).length
      // const worCount = text.trim().length
      totalWordCount = totalWordCount + worCount
      lines.push({verse, text, worCount})
    } else {
      throw new Error('no verse or text')
    }
  }

  let p;
  let d;
  r.forEach(l => {
    if (l.startsWith('<b>')) {
      addLine(p, d)
      p = extract(l)
      d = [];
    } else if (!p) {
      throw 'no verse yet'
    } else {
      d.push(l.replace(/\s+/g, ' ').trim());
    }
  })
  addLine(p,d)
  return {totalWordCount, lines};
}

function updatePerk(perk) {
  const fileName = perkName(perk)
  const data = load(perk);
  const {lines, totalWordCount} = fix(data.verses)
  const gtotalWordCount = totalWordCount +3
  data.perk = extract(data.header).split(' ').pop();
  let startWordCount = 0;
  data.duration = DURATIONS[perk-1]

  data.lines = lines.map((line)=>{

    line.progressStart = Math.round((startWordCount)/gtotalWordCount * 100)
    line.startTime = startWordCount/gtotalWordCount * data.duration
    if (startWordCount === 0) {
      startWordCount = 3;
    }
    startWordCount = startWordCount + line.worCount
    line.progressEnd = Math.round((startWordCount)/gtotalWordCount * 100)
    line.endTime = startWordCount/gtotalWordCount * data.duration
    return line
  });
  data.wordCount = totalWordCount;
  save(fileName, data);
}
for(let i = 1; i <= 150; i++) {
  updatePerk(i)
}

