import {getGematria} from "./gematria.mjs";

export class Perk {
  constructor() {
    this.currentLine = 0;
    this.previousSelectedRow = undefined;
  }
  setLines(perk, lines, isFixTimes = false) {
    if (isFixTimes) {
      this.save();
    }
    this.lines = lines;
    this.perk = perk;
    this.load();
    this.currentLine = 0;
    this.previousSelectedRow = undefined;
  }

  generatePerkTableHTML() {
    const rows = this.lines.map((line, i) => `
        <tr id="row_${i + 1}" class="row">
         <td class="row_num">${line.verse}</td>
         <td class="row_txt">${line.text}</td>
       </tr>`
    );
    const tHead = `
        <thead>
            <tr><th colspan="2">פרק ${getGematria(this.perk)} </th></tr>
       </thead>`

    return `
        <table>
            ${tHead}
            <tbody>
                ${rows.join('\n')}
            </tbody>   
        </table>`;
  }

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }



  getCurrentLine(audioPlayerTime) {
    if (this.currentLine) {
      const {startTime} = this.lines[this.currentLine];
      if (startTime >= audioPlayerTime) {
        this.currentLine = 0;
      }
    }
    return this.currentLine;
  }
  selectLineAtTime(audioPlayerTime, withScroll) {
    const currentLine = this.getCurrentLine(audioPlayerTime)
    for (let i = currentLine; i < this.lines.length ; i++) {
      const {startTime, endTime} = this.lines[i];
      if (startTime <= audioPlayerTime && audioPlayerTime < endTime) {
        this.currentLine = i;
        console.log('selectLineAtTime:', i, 'started at', currentLine)
        break
      }
    }
    const currentRowId = `row_${this.currentLine + 1}`;

    if (this.previousSelectedRow?.id !== currentRowId) {
      if (this.previousSelectedRow?.classList?.contains('highlight')) {
        this.previousSelectedRow.classList.remove('highlight');
      }
      this.previousSelectedRow = document.getElementById(currentRowId);
      this.previousSelectedRow.classList.add('highlight');
      if (withScroll && !this.isElementInViewport(this.previousSelectedRow)) {
        this.previousSelectedRow.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }
  }
  setLineTimes(index, audioPlayerTime) {
    const line = this.lines[index]
    line.startTime = audioPlayerTime;
    if (index>0){
      const previousLine = this.lines[index-1];
      previousLine.endTime = audioPlayerTime;
    }
    console.log('set this.currentLine :',this.currentLine )
    this.currentLine = index
  }

  save() {
    if (this.lines) {
      localStorage.setItem(this.perk, JSON.stringify(this.lines.map(l => ({startTime: l.startTime, endTime: l.endTime}))));
    }
  }

  load(){
    const saved = localStorage.getItem(this.perk);
    if (saved){
      const times = JSON.parse(saved);
      times.forEach(({startTime,endTime }, i) => {

        this.lines[i].startTime = startTime;
        this.lines[i].endTime = endTime;
      });
    }
  }

  getRowStartTime(index){
    return this.lines[index].startTime;
  }

  downloadFile(perk = undefined) {
    let data = {};
    const prakim = perk ? [perk] : Array.from({length:150}, (_,i) => i+1);
    prakim.forEach(perk => {
      const times = localStorage.getItem(perk);
      if (times){
        data[perk] = JSON.parse(times);
      }
    });

    const blob = new Blob([JSON.stringify(data,null,2)], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'perk_times.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}


