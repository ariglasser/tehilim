
import {getGematria} from "./gematria.mjs";
import {Prakim} from "./prakim.mjs";
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

  constructor() {
    this.prakim = new Prakim();
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



  generatePerkTableHTML(perk, lines) {
    const rows = lines.map(line => `
        <tr>
         <td class="row_num">${line.verse}</td>
         <td class="row_txt">${line.text}</td>
       </tr>`
    );
    const tHead = `
        <thead>
            <tr><th colspan="2">פרק ${getGematria(perk)} </th></tr>
       </thead>`

    return `
        <table>
            ${tHead}
            <tbody>
                ${rows.join('\n')}
            </tbody>   
        </table>`;

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

  get perkTable() {
    return this._perkTable ?? (this._perkTable = document.getElementById('perkTable'));
  }

  async getPerkTable(perk) {
    const data = await loadPerkData(perk)
    return this.generatePerkTableHTML(perk, data.lines);
  }

  playPerk(perk, withPlay=true) {
      this.audioPlayer.src = getPerkMp3Name(perk);
      this.audioPlayer.playbackRate = this.playBackRateValue;
      if(withPlay && this.isSound.checked) {
        this.audioPlayer.play();
    }
  }

  navigate(perk, withPlay = true) {
    perk = this.prakim.setPerk(perk)
    this.showPerk(perk);
    this.playPerk(perk, withPlay)
  }

  async showPerk(perk) {
    window.scroll({
      top: 0,
      // behavior: 'smooth' // Optional: Use 'auto' for instant scrolling
    });

    document.querySelectorAll('.perk_header.active').forEach((el) => el.classList.remove('active'));
    document.getElementById(`perk_${perk}`).classList.add('active');

    this.perkTable.innerHTML = await this.getPerkTable(perk);
    return perk
  }

  async addListeners() {
    const formatTime = (seconds)=> {
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
    const progress1 = document.getElementById('progress1');
    const progress2 = document.getElementById('progress2');
    const timeDisplay = document.getElementById('timeDisplay');
    const playBtn = document.getElementById('playBtn');
    const isPlayNext = document.getElementById('isPlayNext');
    const dropDown = document.getElementById('dropdown');
    dropDown.innerHTML = SVG_DROPDOWN

    let playState;

    const updateProgress= () => {
      if (playState !== this.audioPlayer.paused) {
        playState = this.audioPlayer.paused;
        playBtn.innerHTML = playState? SVG_PLAY : SVG_PAUSE
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
      const percent2 = (( (audioPlayerTime + this.prakim.perkStartAt )/this.prakim.totalTime) * 100) || 0;
      progress1.style.width = percent1 + '%';
      progress2.style.width = percent2 + '%';
      timeDisplay.textContent = `${formatTime(adjustedPlayTime)
      }/${formatTime(adjustedDuration)
      } (${formatTime(totalAdjustedPlayTime)
      }/${formatTime(totalAdjustedDuration )})`;
    }

    const togglePlayState =()=>{
      this.isSound.checked = true
      if (this.audioPlayer.paused) {
        this.prakim.perk
          ? this.audioPlayer.play()
          : this.navigate("FIRST");
      } else {
        this.audioPlayer.pause();
      }
    }

    this.isSound.addEventListener('change', (e) => {
      if (!e.target.checked) {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0
      } else if(this.prakim.perk){
        this.audioPlayer.play();
      }
    });

    // this.audioPlayer.addEventListener('play',togglePlayPause);
    // this.audioPlayer.addEventListener('pause',togglePlayPause);
    this.audioPlayer.addEventListener('ended', () => {
      isPlayNext.checked && this.navigate(true)
        // : togglePlayPause()
    });
    this.audioPlayer.addEventListener('timeupdate', updateProgress);

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
        updateProgress()
      }
    })

    playBtn.addEventListener('click', togglePlayState);

    const navigateTo = ["FIRST", "PREVIOUS", "NEXT", "LAST"];
    ['firstButton','prevButton','nextButton','lastButton']
      .forEach((buttonId,i)=>{
        const button = document.getElementById(buttonId);
        button.innerHTML = SVG_NAVIGATE_BUTTONS[i];
        // button.setAttribute('data-action', navigateTo[i]);
        button.dataset.action = navigateTo[i];
        button.addEventListener('click', (e) => this.navigate(e.currentTarget.dataset.action));
      });


    daysOfWeek.value = this.prakim.weekDay
    this.renderPrakimHeader();
    this.navigate('FIRST',false);
    await this.prakim.wait();
    updateProgress()
    daysOfWeek.addEventListener('change', async ()=> {
      this.prakim.weekDay = daysOfWeek.selectedIndex;
      this.audioPlayer.pause()
      this.renderPrakimHeader();
      this.navigate('FIRST',false);
      await this.prakim.wait();
      updateProgress()
    });
  }
}




