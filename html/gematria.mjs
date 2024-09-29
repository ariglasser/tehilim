const GEMATRIA_MAP = {
  0: '', 1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט',
  10: 'י', 20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ', 60: 'ס', 70: 'ע', 80: 'פ',
  90: 'צ', 100: 'ק', 200: 'ר', 300: 'ש', 400: 'ת'
};


export function getGematria(num) {
   let gematria = [400, 300, 200, 100]
      .reduce((heb, g) => {
        const n = Math.floor(num / g)
        num = num % g
        return heb.padEnd(n, GEMATRIA_MAP[g])
      }, '');
    if (num === 15){
      gematria += GEMATRIA_MAP[9] + GEMATRIA_MAP[6]

    } else if (num === 16) {
      gematria += GEMATRIA_MAP[9] + GEMATRIA_MAP[7]

    } else {
      gematria += "".padEnd(1, GEMATRIA_MAP[Math.floor(num / 10) * 10])
      gematria += "".padEnd(1, GEMATRIA_MAP[num % 10])
    }
    return gematria;
  }
