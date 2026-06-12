// &begin[ShipDesign]
const STYLES = {
  carrier:    { hull: '#2e4455', deck: '#3a5468', keel: '#1a2e3d', detail: '#6a8fa8', light: '#c0d8e8' },
  battleship: { hull: '#2e2e3e', deck: '#3e3e50', keel: '#1c1c2a', detail: '#7a7a90', light: '#c0c0d0' },
  cruiser:    { hull: '#24405a', deck: '#304e6e', keel: '#162638', detail: '#6080a0', light: '#b0c8e0' },
  submarine:  { hull: '#2a3e1e', deck: '#3a5228', keel: '#18280e', detail: '#7a9a5a', light: '#b8d4a0' },
  destroyer:  { hull: '#1e2e4a', deck: '#2a3e5e', keel: '#10182c', detail: '#5a7090', light: '#a8bcd0' },
};

function Carrier({ s }) {
  const W = 50, H = 10;
  return (
    <>
      <defs>
        <linearGradient id="cg-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.deck} />
          <stop offset="100%" stopColor={s.keel} />
        </linearGradient>
      </defs>
      {/* wide flat hull */}
      <polygon points={`1,1.5 ${W-1},1.5 ${W-0.5},5 ${W-1},8.5 1,8.5`} fill="url(#cg-hull)" />
      {/* flight deck surface */}
      <rect x="1.5" y="2" width={W-3} height="6" fill={s.deck} opacity="0.5" />
      {/* centerline runway */}
      <line x1="3" y1="5" x2={W-14} y2="5" stroke={s.light} strokeWidth="0.3" strokeDasharray="2,1.5" opacity="0.6" />
      {/* angled catapult */}
      <line x1="3" y1="3.5" x2="18" y2="7.5" stroke={s.light} strokeWidth="0.25" opacity="0.5" />
      {/* island superstructure */}
      <rect x={W-13} y="0.5" width="11" height="5.5" rx="0.5" fill={s.hull} />
      <rect x={W-12} y="0" width="9" height="3" rx="0.3" fill={s.detail} />
      {/* radar/antenna */}
      <line x1={W-8} y1="0" x2={W-8} y2="-1.5" stroke={s.light} strokeWidth="0.4" />
      <line x1={W-8} y1="-1.5" x2={W-11} y2="-0.5" stroke={s.light} strokeWidth="0.3" />
      {/* deck edge markings */}
      <rect x="1.5" y="2" width={W-3} height="0.4" fill={s.detail} opacity="0.4" />
      <rect x="1.5" y="7.6" width={W-3} height="0.4" fill={s.detail} opacity="0.4" />
    </>
  );
}

function Battleship({ s }) {
  const W = 40, H = 10;
  return (
    <>
      <defs>
        <linearGradient id="bg-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.deck} />
          <stop offset="100%" stopColor={s.keel} />
        </linearGradient>
      </defs>
      {/* hull */}
      <polygon points={`2,2 ${W-5},2 ${W-0.5},5 ${W-5},8 2,8 1,5`} fill="url(#bg-hull)" />
      {/* central superstructure */}
      <rect x="16" y="0.5" width="10" height="5.5" rx="0.5" fill={s.hull} />
      <rect x="17.5" y="0" width="7" height="3.5" rx="0.3" fill={s.detail} />
      {/* mast */}
      <line x1="21" y1="0" x2="21" y2="-2" stroke={s.light} strokeWidth="0.4" />
      <line x1="21" y1="-2" x2="18" y2="-0.8" stroke={s.light} strokeWidth="0.3" />
      <line x1="21" y1="-2" x2="24" y2="-0.8" stroke={s.light} strokeWidth="0.3" />
      {/* fore turrets */}
      <circle cx="6" cy="3.8" r="1.8" fill={s.detail} />
      <rect x="7.8" y="3.4" width="3" height="0.8" rx="0.4" fill={s.light} />
      <circle cx="11" cy="5" r="1.6" fill={s.detail} />
      <rect x="12.6" y="4.6" width="2.5" height="0.8" rx="0.4" fill={s.light} />
      {/* aft turrets */}
      <circle cx="31" cy="5" r="1.6" fill={s.detail} />
      <rect x="27.9" y="4.6" width="2.5" height="0.8" rx="0.4" fill={s.light} />
      <circle cx="35" cy="6.2" r="1.8" fill={s.detail} />
      <rect x="31.4" y="5.8" width="3" height="0.8" rx="0.4" fill={s.light} />
    </>
  );
}

function Cruiser({ s }) {
  const W = 30, H = 10;
  return (
    <>
      <defs>
        <linearGradient id="crg-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.deck} />
          <stop offset="100%" stopColor={s.keel} />
        </linearGradient>
      </defs>
      {/* hull */}
      <polygon points={`2,2.5 ${W-4},2.5 ${W-0.5},5 ${W-4},7.5 2,7.5 1,5`} fill="url(#crg-hull)" />
      {/* bridge */}
      <rect x="11" y="1" width="8" height="5" rx="0.5" fill={s.hull} />
      <rect x="12" y="0.5" width="6" height="3" rx="0.3" fill={s.detail} />
      {/* funnel */}
      <rect x="14" y="-0.5" width="2.5" height="2" rx="0.5" fill={s.keel} />
      {/* fore gun */}
      <circle cx="5.5" cy="5" r="1.6" fill={s.detail} />
      <rect x="7.1" y="4.6" width="2.5" height="0.8" rx="0.4" fill={s.light} />
      {/* aft gun */}
      <circle cx="24" cy="5" r="1.6" fill={s.detail} />
      <rect x="20.9" y="4.6" width="2.5" height="0.8" rx="0.4" fill={s.light} />
    </>
  );
}

function Submarine({ s }) {
  const W = 30, H = 10;
  return (
    <>
      <defs>
        <linearGradient id="sg-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.deck} />
          <stop offset="70%" stopColor={s.hull} />
          <stop offset="100%" stopColor={s.keel} />
        </linearGradient>
      </defs>
      {/* main hull — torpedo shape */}
      <ellipse cx={W/2} cy="5" rx={W/2 - 0.5} ry="3.8" fill="url(#sg-hull)" />
      {/* conning tower */}
      <rect x="11" y="0.5" width="8" height="4.5" rx="1" fill={s.hull} />
      <rect x="12" y="0" width="6" height="3" rx="0.8" fill={s.detail} />
      {/* periscopes */}
      <line x1="14.5" y1="0" x2="14.5" y2="-1.8" stroke={s.light} strokeWidth="0.5" />
      <line x1="14.5" y1="-1.8" x2="17" y2="-1.8" stroke={s.light} strokeWidth="0.4" />
      <line x1="17" y1="-1" width="0" height="0" />
      <circle cx="17.2" cy="-1.8" r="0.4" fill={s.light} />
      <line x1="17.5" y1="0" x2="17.5" y2="-1" stroke={s.detail} strokeWidth="0.4" />
      {/* dive planes */}
      <polygon points={`4,3.5 1,2.5 1,4 4,4`} fill={s.detail} />
      <polygon points={`4,6.5 1,7.5 1,6 4,6`} fill={s.detail} />
      {/* propeller */}
      <ellipse cx="28.5" cy="3.5" rx="0.8" ry="1.8" fill={s.detail} opacity="0.7" />
      <ellipse cx="28.5" cy="6.5" rx="0.8" ry="1.8" fill={s.detail} opacity="0.7" />
    </>
  );
}

function Destroyer({ s }) {
  const W = 20, H = 10;
  return (
    <>
      <defs>
        <linearGradient id="dg-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.deck} />
          <stop offset="100%" stopColor={s.keel} />
        </linearGradient>
      </defs>
      {/* sleek tapered hull */}
      <polygon points={`1.5,3 ${W-4},3 ${W-0.5},5 ${W-4},7 1.5,7 1,5`} fill="url(#dg-hull)" />
      {/* bridge */}
      <rect x="8" y="1.5" width="5.5" height="4.5" rx="0.5" fill={s.hull} />
      <rect x="9" y="1" width="3.5" height="3" rx="0.3" fill={s.detail} />
      {/* funnel */}
      <rect x="10" y="0" width="2" height="1.5" rx="0.4" fill={s.keel} />
      {/* gun mount */}
      <circle cx="5" cy="5" r="1.4" fill={s.detail} />
      <rect x="6.4" y="4.65" width="2" height="0.7" rx="0.35" fill={s.light} />
      {/* torpedo tubes */}
      <rect x="4" y="6.2" width="3" height="0.8" rx="0.2" fill={s.detail} opacity="0.8" />
      <rect x="4" y="7.2" width="3" height="0.8" rx="0.2" fill={s.detail} opacity="0.8" />
    </>
  );
}

const SHIP_BODIES = { carrier: Carrier, battleship: Battleship, cruiser: Cruiser, submarine: Submarine, destroyer: Destroyer };
const SHIP_SIZES = { carrier: 5, battleship: 4, cruiser: 3, submarine: 3, destroyer: 2 };
const W_PER_CELL = 10;

export default function ShipGraphic({ shipId, orientation, style, className }) {
  const size = SHIP_SIZES[shipId];
  const s = STYLES[shipId];
  const Body = SHIP_BODIES[shipId];
  if (!Body) return null;

  const isVertical = orientation === 'V';
  const hW = W_PER_CELL * size;
  const hH = W_PER_CELL;

  return (
    <svg
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
      viewBox={isVertical ? `0 0 ${hH} ${hW}` : `0 0 ${hW} ${hH}`}
      preserveAspectRatio="none"
    >
      {isVertical ? (
        <g transform={`translate(0,${hW}) rotate(-90)`}>
          <Body s={s} />
        </g>
      ) : (
        <Body s={s} />
      )}
    </svg>
  );
}
// &end[ShipDesign]
