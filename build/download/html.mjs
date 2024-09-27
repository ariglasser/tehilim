import path from 'node:path'
import fs from 'node:fs'
import * as cheerio from 'cheerio';

const HTML_SOURCE_BASE_URI = 'https://mechon-mamre.org/c/ct/c26';
function sourceArray() {
  const result = [];
  for (let i = 1; i < 100; i++) {
    result.push(i.toString().padStart(2, '0'));
  }

  const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
  let letterIndex = 0;

  for (let i = 100; i < 150; i++) {
    const letter = letters[letterIndex];
    const num = (i % 10).toString();  // Generate the numeric part

    if (i % 10 === 9) {
      letterIndex++;
    }

    result.push(`${letter}${num}`);
  }

  return result;
}
function perkHtmlDownloadUri(perk) {
  let key;
  if (perk < 100){
    key =  perk.toString().padStart(2, '0');
  } else {
    perk = perk - 100;
    const tens = Math.floor(perk / 10);
    const diget= perk % 10
    const letter = ['a', 'b', 'c', 'd', 'e', 'f'][tens];
    key = `${letter}${diget}`;
  }
  return `${HTML_SOURCE_BASE_URI}${key}.htm`;
}

export const perkName = (perk) => `${perk.toString().padStart(3, '0')}`
export const perkSaveAsName = (perk) => path.join(BASE_PATH,'html','prakim',`${perkName(perk)}.json`)


// Fetch the JSON data and save it to disk
async function fetchDoument(url) {
    console.log(`Fetching ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: from url ${url} ${response.statusText}`);
    }
    return response.text();
}

function getJson(html) {

    // Load the HTML into Cheerio
    const api = cheerio.load(html);
    const verses = api('p.ct')
      .contents()
      .toArray()
      .map(e=>api(e).toString())
      .filter(t => t !== '\n')
  const header = api(api('h1')[0]).toString()

    return {header, verses};
}
async function downloadPerk(perk){
  const destination = perkSaveAsName(perk)
  if (!fs.existsSync(destination)) {
    const perkUri = perkHtmlDownloadUri(perk)
  // console.log(destination, perkUri)
    const html = await fetchDoument(perkUri)
    const data = getJson(html)
    fs.writeFileSync(destination, JSON.stringify(data,null, 2))
    return destination
  }
}


async function downloadPrakim(from,to){
  to = Math.min(to, 150)
  const downloaded =
    Array.from({ length: to - from + 1 }, (a_, i) =>  (i+from))
      .map(downloadPerk)
  const response = await Promise.all(downloaded);
  console.log(response.filter(Boolean))
  return response
}

let i = 1;
while (i<150) {
  const s = i;
  i = i + 10
  console.log(`Downloading ${s} to ${i}`)
  await downloadPrakim(s, i);
}
