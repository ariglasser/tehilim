import {getGematria} from "./gematria.mjs";
import {Properties} from "./Properties.mjs";
import {loadPerkData} from "./resources.mjs";

export class Perk {
  constructor() {
    this.config = new Properties();
    this.currentLine = 0;
    this.previousSelectedRow = undefined;
    window.addEventListener('beforeunload', () => {
      this.save();
    });

  }
  async updatePerkData(perk) {
    this.save();
    const data = await loadPerkData(perk);
    this.lines = data.lines;
    this.duration = data.duration;
    this.perk = perk;
    this.originalTimes = this.lines.map(line=>line.startTime);
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
            <tr><th id='resetHeader' colspan="2">פרק ${getGematria(this.perk)} </th></tr>
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
      const startTime = this.getRowStartTime(this.currentLine)
      if (startTime >= audioPlayerTime) {
        this.currentLine = 0;
      }
    }
    return this.currentLine;
  }
  selectLineAtTime(audioPlayerTime) {
    const currentLine = this.getCurrentLine(audioPlayerTime)

    for (let i = currentLine; i < this.lines.length ; i++) {
      const {startTime, endTime} = this.getRowTimes(i);
      if (startTime <= audioPlayerTime && audioPlayerTime < endTime) {
        this.currentLine = i;
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
      if (this.config.isAutoScroll && !this.isElementInViewport(this.previousSelectedRow)) {
        this.previousSelectedRow.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }
  }

  setLineTimes(index, audioPlayerTime) {
    if (index === 0 ) {
      audioPlayerTime =0;
    }
    const line = this.lines[index]
    line.startTime = audioPlayerTime;
    let i = index+1;


    while(this.lines[i]?.startTime < audioPlayerTime && i<this.lines.length) {
      this.lines[i].startTime = Math.max(this.lines[i-1].endTime, audioPlayerTime + 3);
      i++
    }


    this.currentLine = index
  }

  clearOverrides(){
    localStorage.removeItem(this.perkKey(this.perk));
    this.lines.forEach((line,i)=>{
      line.startTime = this.originalTimes[i]
    })
  }

  perkKey(perk){
    return `${perk}`
  }
  save() {
    if (this.perk && this.lines) {
      localStorage.setItem(this.perkKey(this.perk), JSON.stringify(this.lines.map(l => ({startTime: l.startTime}))));
    }
  }

  load(){
    const saved = localStorage.getItem(this.perkKey(this.perk));
    if (saved){
      const times = JSON.parse(saved);
      times.forEach(({startTime }, i) => {
        this.lines[i].startTime = startTime;
      });
    }
  }

  getRowStartTime(index){
    return  index === 0 ? 0 : this.lines[index].startTime;
  }

  getRowEndTime(index){
    return index+1 === this.lines.length ? this.duration : this.lines[index+1].startTime
  }

  getRowTimes(index){
    const startTime = this.getRowStartTime(index);
    const endTime = this.getRowEndTime(index);
    return {startTime,endTime}
  }
}


