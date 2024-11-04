
import {getGematria} from "./gematria.mjs";
import {Prakim} from "./prakim.mjs";
import {Perk} from "./perk.mjs";
import {loadPerkData, getPerkMp3Name} from "./resources.mjs";

const SVG_PLAY = `
 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="black">
 <polygon points="5,3 19,12 5,21" />
 </svg>`

const SVG_PAUSE = `
 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
 <rect x="6" y="4" width="4" height="16" />
 <rect x="14" y="4" width="4" height="16" />
 </svg>`

const SVG_DROPDOWN = `   <svg viewBox="0 0 24 26" fill="black" xmlns="http://www.w3.org/2000/svg">
                    <rect x='3' y="18" width="20" height="3"  fill="black"></rect>
                    <rect x='3' y="12" width="20" height="3"  fill="black"></rect>
                    <rect x='3' y="6"  width="20" height="3"  fill="black"></rect>
                </svg>
`

const SVG_NAVIGATE_BUTTONS=[
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 18l7-6-7-6v12z"/>
                <path d="M13 18l7-6-7-6v12z"/>
            </svg>`,
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 6l6 6-6 6V6z"/>
            </svg>`,
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 18l-6-6 6-6v12z"/>
            </svg>`,
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 6l-7 6 7 6V6z"/>
                <path d="M11 6l-7 6 7 6V6z"/>
            </svg>`
  ]; //['⏮','⏪','⏯','⏩','⏭
//'⏮','⏪','⏯','⏩','⏭'

export class Controller {
  prakim;

  _playBackRate;
  _audioPlayer;
  _perkTable;
  _isSound;
  _config;
  _isPlayNext;
  _progress1;
  _progress2;
  _timeDisplay;
  _playBtn;
  playState;
  _perkData;

  constructor() {
    this.prakim = new Prakim();
    if (this.config.d === this.prakim.weekDay && this.config.p){
      this.prakim.CURRENT = this.config.p
    }
  }


  renderPrakimHeader() {
    const prakimHeader = document.getElementById('prakimHeader');
    prakimHeader.innerHTML=
      this.prakim.prakim
        .map(p => `<span id="perk_${p}" class="perk_header"> ${getGematria(p)}</span>`)
        .join(',');

    document.querySelectorAll('.perk_header').forEach((el,i) => {
      el.dataset.perek = this.prakim.perkAt(i);
      el.addEventListener('click', (e) => this.navigate(e.currentTarget.dataset.perek*1));
    });
  }

  showRow(rowNumber) {
    this._perkData.setLineTimes(rowNumber, this.audioPlayer.currentTime);

  }




  setEstimatedLineTime(lines, totalDuration) {
    //
    //   lines.forEach(line => {
    //     const lineDuration = (line.wordCount / totalWordCount) * totalDuration;
    //     line.start = currentTime;
    //     line.end = currentTime + lineDuration;
    //     currentTime += lineDuration;
    //   });
    // }
    // return this._estimatedLineTime

  }



  get playBackRate() {
    return (this._playBackRate ?? (this._playBackRate = document.getElementById('playBackRate')));
  }

  get isSound() {
    return (this._isSound ?? (this._isSound = document.getElementById('isSound')));
  }

  get playBackRateValue() {
    return this.playBackRate.value
  }

  get audioPlayer() {
    return this._audioPlayer ?? (this._audioPlayer = document.getElementById('audioPlayer'));
  }
  const  = document.getElementById('');

  get isPlayNext() {
    return this._isPlayNext ?? (this._isPlayNext = document.getElementById('isPlayNext'));
  }

  get progress1() {
    return this._progress1 ?? (this._progress1 = document.getElementById('progress1'));
  }

  get progress2() {
    return this._progress2 ?? (this._progress2 = document.getElementById('progress2'));
  }

  get timeDisplay() {
    return this._timeDisplay ?? (this._timeDisplay = document.getElementById('timeDisplay'));
  }

  get playBtn() {
    return this._playBtn ?? (this._playBtn = document.getElementById('playBtn'));
  }


  get perkTable() {
    return this._perkTable ?? (this._perkTable = document.getElementById('perkTable'));
  }

  playPerk(perk, withPlay=true) {
      this.audioPlayer.src = getPerkMp3Name(perk);
      this.audioPlayer.playbackRate = this.playBackRateValue;
      if(withPlay && this.isSound.checked) {
        this.audioPlayer.play();
    }
  }

  navigate(perk, withPlay = true) {
    this.hasPlayed = true;
    perk = this.prakim.setPerk(perk)
    this.saveConfig();
    this.showPerk(perk);
    this.playPerk(perk, withPlay)
  }

  async showPerk(perk) {
    //log the current scroll position
    window.scroll({
      top: 0,
      // behavior: 'smooth' // Optional: Use 'auto' for instant scrolling
    });

    document.querySelectorAll('.perk_header.active').forEach((el) => el.classList.remove('active'));
    document.getElementById(`perk_${perk}`).classList.add('active');

    const data = await loadPerkData(perk)
    if (this._perkData) {
      this._perkData.save();
    }
    this._perkData = new Perk(perk, data);
    this.perkTable.innerHTML = this._perkData.generatePerkTableHTML();
    [...document.getElementsByClassName('row')].forEach((el,i) => el.addEventListener('click', () => this.showRow(i)));
    return perk
  }

  saveConfig() {
    this._config = {
      s:this.playBackRateValue,
      p:this.prakim.perk,
      n:this.isPlayNext.checked,
      l:this.isSound.checked,
      d:this.prakim.weekDay
    }
    const value = JSON.stringify(this._config)
    const date = new Date();
    date.setTime(date.getTime() + (100 * 24 * 60 * 60 * 1000))
    document.cookie = `config=${value}; expires=${date.toUTCString()}; path=/`;


    }

  get config() {
    if (!this._config) {
      const cookies = document.cookie.split(';');
      let configCookieValue = cookies.find(c => c.trim().startsWith('config='));
      this._config = {};
      if (configCookieValue) {
        configCookieValue = configCookieValue.replace('config=', '');
        this._config =  JSON.parse(configCookieValue)
      }
      this._config.s = this._config.s ?? 1;
      this._config.n = this._config.n ?? true;
      this._config.l = this._config.n ?? true;
    }
    return this._config;
  }

  formatTime(seconds) {
    seconds = isNaN(seconds) ? 0 : seconds;

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Format the time parts as strings with leading zeros if needed
    const hrsStr = hrs.toString().padStart(2, '0')
    const minsStr = mins.toString().padStart(2, '0')
    const secsStr = secs.toString().padStart(2, '0')

    // Combine the parts and return the formatted string
    return `${hrs > 0 ? hrsStr + ':' : ''}${minsStr}:${secsStr}`.trim();
  }

  updateProgress () {
    if (this.playState !== this.audioPlayer.paused) {
      this.playState = this.audioPlayer.paused;
      this.playBtn.innerHTML = this.playState? SVG_PLAY : SVG_PAUSE
    }

    const audioPlayerTime = this.audioPlayer.currentTime;
    const audioPlayerDuration = this.audioPlayer.duration;
    const speed = this.playBackRateValue;

    const adjustedDuration = audioPlayerDuration / speed;
    const adjustedPlayTime = audioPlayerTime / speed;
    const totalAdjustedDuration = this.prakim.totalTime / speed;
    const totalAdjustedPlayTime = this.prakim.perkStartAt / speed;


    // Calculate the percentage of progress
    const percent1 = ((audioPlayerTime / audioPlayerDuration) * 100) || 0;
    const percent2 = (((audioPlayerTime + this.prakim.perkStartAt )/this.prakim.totalTime) * 100) || 0;
    if (this._perkData) {
      this._perkData.selectLineAtTime(audioPlayerTime);
    }

    this.progress1.style.width = percent1 + '%';
    this.progress2.style.width = percent2 + '%';
    this.timeDisplay.textContent = `${this.formatTime(adjustedPlayTime)
    }/${this.formatTime(adjustedDuration)
    } (${this.formatTime(totalAdjustedPlayTime)
    }/${this.formatTime(totalAdjustedDuration )})`;
  }

  playSoundChanged(){
    this.saveConfig();
    if (!this.isSound.checked) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0
    } else if(this.prakim.perk){
      this.audioPlayer.play();
    }
  }


   togglePlayState() {
    this.isSound.checked = true
    if (this.audioPlayer.paused) {
      this.prakim.perk
        ? this.audioPlayer.play()
        : this.navigate("FIRST");
    } else {
      this.audioPlayer.pause();
    }
  }

  onPerkEnd(){
    this.isPlayNext.checked && this.prakim.perk < this.prakim.to && this.navigate(true)
  }

  async addListeners() {
    this.playBackRate.value = this.config.s;
    this.isPlayNext.checked = this.config.n;
    this.isSound.checked = this.config.l;

    document.getElementById('dropdown').innerHTML = SVG_DROPDOWN
    document.getElementById('downloadTimes').addEventListener('click',()=> this._perkData.downloadFile());

    this.isSound.addEventListener('change', () => this.playSoundChanged());
    this.audioPlayer.addEventListener('ended', () => this.onPerkEnd());
    this.audioPlayer.addEventListener('timeupdate', ()=>this.updateProgress());

    const volumeControl = document.getElementById('volume');
    const volumeLabel = document.getElementById('volumeLabel');

    const speedLabel = document.getElementById('speedLabel');
    const daysOfWeek = document.getElementById('daysOfWeek');

    volumeControl.addEventListener('input', (e) => {
      this.audioPlayer.volume = e.target.value;
      volumeLabel.textContent = `Volume ${e.target.value}:`;
    })

    this.playBackRate.addEventListener('input', (e) => {
      this.audioPlayer.playbackRate = e.target.value;
      speedLabel.textContent = `Speed ${e.target.value}:`;
      this.saveConfig();
      if (this.audioPlayer.paused) {
        this.updateProgress()
      }
    })
    speedLabel.textContent = `Speed ${this.config.s}:`;

    this.playBtn.addEventListener('click', ()=>this.togglePlayState());

    const navigateTo = ["FIRST", "PREVIOUS", "NEXT", "LAST"];
    ['firstButton','prevButton','nextButton','lastButton']
      .forEach((buttonId,i)=>{
        const button = document.getElementById(buttonId);
        button.innerHTML = SVG_NAVIGATE_BUTTONS[i];
        button.dataset.action = navigateTo[i];
        button.addEventListener('click', (e) => this.navigate(e.currentTarget.dataset.action));
      });


    daysOfWeek.value = this.prakim.weekDay
    this.renderPrakimHeader();
    this.navigate(this.prakim.CURRENT ?? 'FIRST',false);
    await this.prakim.wait();
    this.updateProgress()
    daysOfWeek.addEventListener('change', async ()=> {
      this.prakim.weekDay = daysOfWeek.selectedIndex;
      this.audioPlayer.pause()
      this.renderPrakimHeader();
      this.navigate(this.prakim.CURRENT ?? 'FIRST',false);
      await this.prakim.wait();
      this.updateProgress()
    });
  }
}




