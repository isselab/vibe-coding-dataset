// Top-down naval vessel silhouettes. Bow points RIGHT, stern LEFT.
// All designs share a viewBox of "0 0 {length*40} 40".

const H = '#1a3a5e'   // hull base
const D = '#264d78'   // deck
const S = '#336690'   // superstructure
const T = '#3f7aa8'   // tower / upper deck
const A = '#6aafd4'   // accent / windows
const G = '#12283f'   // gun / dark detail

function Destroyer() {
  // 2 cells → 80×40. Sleek fast escort, narrow pointed hull.
  return (
    <svg viewBox="0 0 80 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Hull */}
      <path d="M 3,20 L 8,13 L 60,12 L 77,20 L 60,28 L 8,27 Z" fill={H} stroke="#0d2035" strokeWidth="0.5"/>
      {/* Deck */}
      <path d="M 10,17 L 58,16 L 72,20 L 58,24 L 10,23 Z" fill={D}/>
      {/* Bridge block */}
      <rect x="32" y="14" width="20" height="12" rx="2" fill={S}/>
      <rect x="32" y="13" width="20" height="6" rx="1" fill={T}/>
      {/* Bridge windows */}
      <rect x="34" y="14" width="16" height="3" rx="1" fill={A} opacity="0.7"/>
      {/* Funnel */}
      <rect x="40" y="11" width="6" height="18" rx="1" fill={D}/>
      <rect x="41" y="10" width="4" height="5" rx="1" fill="#1a3050"/>
      {/* Fore gun turret */}
      <circle cx="19" cy="20" r="5" fill={G}/>
      <rect x="20" y="19" width="12" height="2" rx="1" fill={A}/>
      {/* Bow taper */}
      <path d="M 58,14 L 76,20 L 58,26" fill={D}/>
    </svg>
  )
}

function Submarine() {
  // 3 cells → 120×40. Cigar hull, prominent conning tower (sail).
  return (
    <svg viewBox="0 0 120 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Hull – elliptical cigar */}
      <path d="M 5,20 Q 8,9 18,9 L 102,9 Q 112,9 115,20 Q 112,31 102,31 L 18,31 Q 8,31 5,20 Z" fill={H} stroke="#0d2035" strokeWidth="0.5"/>
      {/* Deck stripe */}
      <rect x="12" y="17" width="96" height="6" rx="2" fill={D}/>
      {/* Conning tower / sail */}
      <rect x="45" y="10" width="30" height="20" rx="4" fill={S}/>
      <rect x="49" y="7" width="22" height="10" rx="3" fill={T}/>
      {/* Periscopes */}
      <line x1="56" y1="3" x2="56" y2="9" stroke={A} strokeWidth="1.5"/>
      <line x1="64" y1="4" x2="64" y2="9" stroke={A} strokeWidth="1.5"/>
      <circle cx="56" cy="3" r="1.5" fill={A}/>
      <circle cx="64" cy="4" r="1.5" fill={A}/>
      {/* Hull ends */}
      <ellipse cx="10" cy="20" rx="6" ry="9" fill="#12283f"/>
      <ellipse cx="110" cy="20" rx="6" ry="9" fill="#12283f"/>
    </svg>
  )
}

function Cruiser() {
  // 3 cells → 120×40. Light warship, single fore turret, streamlined.
  return (
    <svg viewBox="0 0 120 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Hull */}
      <path d="M 3,20 L 10,12 L 100,11 L 117,20 L 100,29 L 10,28 Z" fill={H} stroke="#0d2035" strokeWidth="0.5"/>
      {/* Deck */}
      <path d="M 12,16 L 98,15 L 112,20 L 98,25 L 12,24 Z" fill={D}/>
      {/* Superstructure */}
      <rect x="52" y="14" width="34" height="12" rx="2" fill={S}/>
      <rect x="58" y="12" width="22" height="8" rx="2" fill={T}/>
      {/* Bridge windows */}
      <rect x="60" y="13" width="18" height="3" rx="1" fill={A} opacity="0.7"/>
      {/* Mast */}
      <line x1="69" y1="8" x2="69" y2="14" stroke={A} strokeWidth="1.2"/>
      {/* Fore main gun turret */}
      <circle cx="24" cy="20" r="7" fill={G}/>
      <rect x="26" y="18.5" width="16" height="3" rx="1" fill={A}/>
      <rect x="26" y="15" width="16" height="2.5" rx="1" fill={A}/>
      {/* Aft gun */}
      <circle cx="103" cy="20" r="5" fill={G}/>
      <rect x="88" y="19" width="12" height="2" rx="1" fill={A}/>
      {/* Bow */}
      <path d="M 98,13 L 116,20 L 98,27" fill={D}/>
    </svg>
  )
}

function Battleship() {
  // 4 cells → 160×40. Heavy warship, twin fore turrets, large command tower.
  return (
    <svg viewBox="0 0 160 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Hull */}
      <path d="M 3,20 L 13,11 L 138,10 L 157,20 L 138,30 L 13,29 Z" fill={H} stroke="#0d2035" strokeWidth="0.5"/>
      {/* Deck */}
      <path d="M 16,15 L 136,14 L 152,20 L 136,26 L 16,25 Z" fill={D}/>
      {/* Main superstructure */}
      <rect x="72" y="13" width="46" height="14" rx="2" fill={S}/>
      {/* Command tower */}
      <rect x="82" y="10" width="26" height="10" rx="2" fill={T}/>
      <rect x="86" y="8" width="18" height="6" rx="2" fill={T}/>
      {/* Tower windows */}
      <rect x="84" y="11" width="22" height="3" rx="1" fill={A} opacity="0.75"/>
      {/* Mast */}
      <line x1="95" y1="4" x2="95" y2="10" stroke={A} strokeWidth="1.5"/>
      <line x1="88" y1="6" x2="102" y2="6" stroke={A} strokeWidth="1"/>
      {/* Fore turret A (twin guns) */}
      <circle cx="28" cy="20" r="7" fill={G}/>
      <rect x="30" y="15" width="18" height="2.5" rx="1" fill={A}/>
      <rect x="30" y="22.5" width="18" height="2.5" rx="1" fill={A}/>
      {/* Fore turret B */}
      <circle cx="48" cy="20" r="6" fill={G}/>
      <rect x="50" y="18.5" width="14" height="3" rx="1" fill={A}/>
      {/* Aft turret */}
      <circle cx="138" cy="20" r="6" fill={G}/>
      <rect x="120" y="18.5" width="14" height="3" rx="1" fill={A}/>
      {/* Bow */}
      <path d="M 136,12 L 156,20 L 136,28" fill={D}/>
    </svg>
  )
}

function Carrier() {
  // 5 cells → 200×40. Flat flight deck, island superstructure starboard side.
  return (
    <svg viewBox="0 0 200 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Hull – wide rectangular */}
      <path d="M 4,9 L 196,9 L 199,20 L 196,31 L 4,31 Z" fill={H} stroke="#0d2035" strokeWidth="0.5"/>
      {/* Flight deck surface */}
      <rect x="6" y="11" width="188" height="18" rx="1" fill={D}/>
      {/* Angled deck overlay */}
      <path d="M 30,29 L 148,12 L 170,12 L 170,29 Z" fill="#2a5878" opacity="0.6"/>
      {/* Deck center line */}
      <line x1="10" y1="20" x2="190" y2="20" stroke="#3a6880" strokeWidth="0.8" strokeDasharray="8 4"/>
      {/* Island superstructure (starboard = top in this view) */}
      <rect x="144" y="9" width="44" height="13" rx="1" fill={S}/>
      <rect x="148" y="7" width="36" height="7" rx="1" fill={T}/>
      {/* Island windows */}
      <rect x="150" y="8" width="30" height="3" rx="1" fill={A} opacity="0.7"/>
      {/* Radar mast */}
      <line x1="175" y1="3" x2="175" y2="9" stroke={A} strokeWidth="1.5"/>
      <circle cx="175" cy="3" r="2" fill={A} opacity="0.8"/>
      {/* Elevator markers */}
      <rect x="8" y="12" width="12" height="8" rx="1" fill="#1e4060" opacity="0.8"/>
      <rect x="8" y="25" width="12" height="4" rx="1" fill="#1e4060" opacity="0.8"/>
      <rect x="185" y="15" width="10" height="7" rx="1" fill="#1e4060" opacity="0.8"/>
      {/* Bow taper */}
      <path d="M 194,11 L 199,20 L 194,29" fill="#1e4060"/>
    </svg>
  )
}

const DESIGNS = { carrier: Carrier, battleship: Battleship, cruiser: Cruiser, submarine: Submarine, destroyer: Destroyer }

export default function ShipSvg({ shipId }) {
  const Component = DESIGNS[shipId]
  return Component ? <Component /> : null
}
