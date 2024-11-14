
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
  _isFixTimes;
  _isAutoScroll;
  _progress1;
  _progress2;
  _timeDisplay;
  _playBtn;
  playState;
  perkData;

  constructor() {
    this.prakim = new Prakim();
    this.perkData = new Perk()
    if (this.config.weekDay === this.prakim.weekDay && this.config.weekDay){
      this.prakim.CURRENT = this.config.perk;
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

  isPlaying(){
    return !this.audioPlayer.paused && !this.audioPlayer.ended;
  }
  showRow(e, rowNumber) {
    if (!this.isFixTimes.checked || e?.target?.classList.contains('row_num')) {
      this.audioPlayer.currentTime = this.perkData.getRowStartTime(rowNumber);
    } else {
      if (this.isPlaying()) {
        this.perkData.setLineTimes(rowNumber, this.audioPlayer.currentTime);
      }
    }
  }

  clearOverrides() {
    this.audioPlayer.currentTime = 0;
    this.perkData.clearOverrides()
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

  get isFixTimes() {
    return this._isFixTimes ?? (this._isFixTimes = document.getElementById('isFixTimes'));
  }

  get isAutoScroll() {
    return this._isAutoScroll?? (this._isAutoScroll = document.getElementById('isAutoScroll'));
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
    this.config.save();
    this.showPerk(perk).catch(console.error);
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


    this.perkData.setPerkData(perk, data, this.isFixTimes.checked);
    this.perkTable.innerHTML = this.perkData.generatePerkTableHTML();
    [...document.getElementsByClassName('row')].forEach((el,i) => el.addEventListener('click', (e) => this.showRow(e,i)));
    document.getElementById('resetHeader').addEventListener('dblclick',()=> this.clearOverrides())
    return perk
  }

  get config() {
    if (!this._config) {
      this._config = JSON.parse(localStorage.getItem('config') ?? '{}');

      this._config.playBackRate = this._config.playBackRate ?? 1;
      this._config.isPlayNext = this._config.isPlayNext ?? true;
      this._config.isSound = this._config.isSound ?? true;

      this._config.save = () => {
        const config = {
          playBackRate: this.playBackRateValue,
          perk: this.prakim.perk,
          isPlayNext: this.isPlayNext.checked,
          isSound: this.isSound.checked,
          weekDay: this.prakim.weekDay,
          isFixTimes: this.isFixTimes.checked
        }
        const value = JSON.stringify(config)
        localStorage.setItem('config', value);
      }
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
    this.perkData.selectLineAtTime(audioPlayerTime, this.isAutoScroll.checked);

    this.progress1.style.width = percent1 + '%';
    this.progress2.style.width = percent2 + '%';
    this.timeDisplay.textContent = `${this.formatTime(adjustedPlayTime)
    }/${this.formatTime(adjustedDuration)
    } (${this.formatTime(totalAdjustedPlayTime)
    }/${this.formatTime(totalAdjustedDuration )})`;
  }

  playSoundChanged(){
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
    this.playBackRate.value = this.config.playBackRate;
    this.isPlayNext.checked = this.config.isPlayNext;
    this.isSound.checked = this.config.isSound;
    this.isFixTimes.checked = this.config.isFixTimes;

    document.getElementById('dropdown').innerHTML = SVG_DROPDOWN
    const downloadTimes = document.getElementById('downloadTimes');

    downloadTimes.addEventListener('click',()=> this.perkData.downloadFile());
    this.isFixTimes.addEventListener('change', () => {
      downloadTimes.style.display = this.isFixTimes.checked ? 'inline' : 'none';
    });
    downloadTimes.style.display = this.isFixTimes.checked ? 'inline' : 'none';

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
      if (this.audioPlayer.paused) {
        this.updateProgress()
      }
    })
    speedLabel.textContent = `Speed ${this.playBackRateValue}:`;

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


    const progressBar = document.getElementById('progressContainer');
    progressBar.addEventListener('click', (event) => {
      const progressBarWidth =  progressBar.clientWidth;
      const clickPosition = event.target.clientWidth - event.offsetX;
      const clickPercentage = (clickPosition / progressBarWidth) * 100;


      if(this.audioPlayer.readyState >= 2) {
        this.audioPlayer.currentTime = (clickPercentage / 100) * this.audioPlayer.duration;
      }

    });

    window.addEventListener('beforeunload', () => {
      this.perkData.save();
      this.config.save();
    });
  }
}




