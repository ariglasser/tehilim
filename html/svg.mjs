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
                </svg>`
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

export {
  SVG_NAVIGATE_BUTTONS,
  SVG_DROPDOWN,
  SVG_PAUSE,
  SVG_PLAY
}
