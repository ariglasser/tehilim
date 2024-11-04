import {getGematria} from "./gematria.mjs";

export class Perk {
  constructor(perk, json) {
    this.json = json;
    this.perk = perk;
    this.load();
    this.currentLine = 0;
    this.previousSelectedRow = undefined;
  }

  generatePerkTableHTML() {
    const rows = this.json.lines.map((line, i) => `
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

  getTimesForLine(index) {
    const line = this.json.lines[index]
    const {startTime, endTime} = line;
    return {startTime, endTime};
  }

  resetIfNeeded(audioPlayerTime) {
    if (this.currentLine) {
      const {startTime, endTime} = this.getTimesForLine(this.currentLine);
      if (startTime >= audioPlayerTime) {
        this.currentLine = 0;
      }
    }
  }
  selectLineAtTime(audioPlayerTime) {
    this.resetIfNeeded(audioPlayerTime)
    for (let i = this.currentLine; i < this.json.lines.length ; i++) {
      const {startTime, endTime} = this.getTimesForLine(i);
      if (startTime <= audioPlayerTime && audioPlayerTime < endTime) {
        this.currentLine = i;
        break
      }
    }
    const currentRowId = `row_${this.currentLine + 1}`;
    if (this.previousSelectedRow
      && this.previousSelectedRow.id !== currentRowId
      && this.previousSelectedRow.classList.contains('highlight')) {
      this.previousSelectedRow.classList.remove('highlight');
    } else {
      this.previousSelectedRow = document.getElementById(currentRowId);
      this.previousSelectedRow.classList.add('highlight');
      if (!this.isElementInViewport(this.previousSelectedRow)) {
        const rect = this.previousSelectedRow.getBoundingClientRect();
        this.previousSelectedRow.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }
  }
  setLineTimes(index, audioPlayerTime) {
    const line = this.json.lines[index]
    const {startTime, endTime} = line;
    line.startTime = audioPlayerTime;
    if (index>0){
      const previousLine = this.json.lines[index-1];
      previousLine.endTime = audioPlayerTime;
    }
  }

  save() {
    localStorage.setItem(this.perk, JSON.stringify(this.json.lines.map(l => ({startTime: l.startTime, endTime: l.endTime}))));
  }

  load(){
    const saved = localStorage.getItem(this.perk);
    if (saved){
      const times = JSON.parse(saved);
      this.json.lines.forEach((line, i) => {
        line.startTime = times[i].startTime;
        line.endTime = times[i].endTime;
      });
    }
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


