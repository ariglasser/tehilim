import fs from 'node:fs'
import {perkName} from '../common/index.mjs'

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

function fix(lines) {
  let r = lines
    .map(l => l.trim());
  r = r
    .filter(l => !l.startsWith('<a '))
    .filter(l => !l.startsWith('<br>'));
  r = r
    .map(l => l.split('&nbsp;').filter(t=>t.length).join(' '))

  const response = []
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
      response.push({verse, text})
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
  return response;
}

function updatePerk(perk) {
  const fileName = perkName(perk)
  const data = load(perk);
  data.lines = fix(data.verses)
  data.perk = extract(data.header).split(' ').pop();
  save(fileName, data);
}
for(let i = 1; i <= 150; i++) {
  updatePerk(i)
}

