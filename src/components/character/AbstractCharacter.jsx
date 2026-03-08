// mood: 1=עצוב מאוד, 2=עצוב, 3=ניטרלי, 4=שמח, 5=שמח מאוד (null = ברירת מחדל - חיוך)
export default function AbstractCharacter({ color = '#FF8C69', accessory = null, size = 120, animated = false, mood = null }) {

  // הבעת פנים לפי מצב רוח
  const face = getFace(mood)

  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 120 144"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
    >
      <style>{`
        @keyframes char-bounce {
          0%, 100% { transform: translateY(0); }
          40%       { transform: translateY(-5px); }
        }
        @keyframes char-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25%       { transform: rotate(-3deg); }
          75%       { transform: rotate(3deg); }
        }
        @keyframes char-sad {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(3px); }
        }
        @keyframes char-idle {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-2px) scale(1.01); }
        }
        @keyframes char-blink {
          0%, 88%, 100% { scaleY: 1; }
          93%            { transform: scaleY(0.1); }
        }
        @keyframes tear-drop {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(14px); opacity: 0; }
        }
        @keyframes char-heart {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.2); }
        }
      `}</style>

      {/* גוף */}
      <g style={{
        animation: animated
          ? (mood >= 4 ? 'char-bounce 1.4s ease-in-out infinite' : mood <= 2 ? 'char-sad 3s ease-in-out infinite' : 'char-idle 3s ease-in-out infinite')
          : 'char-idle 4s ease-in-out infinite',
        transformOrigin: '60px 100px',
      }}>
        {/* גוף */}
        <rect x="30" y="72" width="60" height="60" rx="28" fill={color} />

        {/* ראש */}
        <circle cx="60" cy="52" r="32" fill={color} />
        <circle cx="60" cy="52" r="32" fill="rgba(0,0,0,0.04)" />

        {/* לחיים */}
        <circle cx="38" cy="60" r="7" fill="rgba(255,100,100,0.18)" />
        <circle cx="82" cy="60" r="7" fill="rgba(255,100,100,0.18)" />

        {/* עיניים */}
        {face.eyes}

        {/* פה */}
        {face.mouth}

        {/* דמעות אם עצוב מאוד */}
        {mood === 1 && (
          <>
            <ellipse cx="47" cy="58" rx="2.5" ry="3.5" fill="#74C0FC"
              style={{ animation: 'tear-drop 2s ease-in infinite' }} />
            <ellipse cx="73" cy="58" rx="2.5" ry="3.5" fill="#74C0FC"
              style={{ animation: 'tear-drop 2s ease-in 0.8s infinite' }} />
          </>
        )}

        {/* כוכבים אם שמח מאוד */}
        {mood === 5 && (
          <>
            <text x="88" y="28" fontSize="12" style={{ animation: 'char-heart 1.5s ease-in-out infinite' }}>✨</text>
            <text x="16" y="32" fontSize="10" style={{ animation: 'char-heart 1.5s ease-in-out 0.5s infinite' }}>⭐</text>
          </>
        )}

        {/* ידיים */}
        <ellipse cx="18" cy="92" rx="10" ry="7" fill={color} transform="rotate(-20 18 92)" />
        <ellipse cx="102" cy="92" rx="10" ry="7" fill={color} transform="rotate(20 102 92)" />
      </g>

      {/* אביזרים */}
      {accessory === 'hat' && (
        <g>
          <rect x="38" y="10" width="44" height="28" rx="6" fill="#4a4a4a" />
          <rect x="28" y="36" width="64" height="8" rx="4" fill="#333" />
        </g>
      )}
      {accessory === 'bow' && (
        <g>
          <ellipse cx="48" cy="22" rx="12" ry="8" fill="#FF6B9D" transform="rotate(-20 48 22)" />
          <ellipse cx="72" cy="22" rx="12" ry="8" fill="#FF6B9D" transform="rotate(20 72 22)" />
          <circle cx="60" cy="22" r="5" fill="#FF4081" />
        </g>
      )}
      {accessory === 'glasses' && (
        <g>
          <circle cx="48" cy="46" r="11" fill="none" stroke="#555" strokeWidth="2.5" />
          <circle cx="72" cy="46" r="11" fill="none" stroke="#555" strokeWidth="2.5" />
          <line x1="59" y1="46" x2="61" y2="46" stroke="#555" strokeWidth="2.5" />
          <line x1="27" y1="44" x2="37" y2="46" stroke="#555" strokeWidth="2.5" />
          <line x1="83" y1="46" x2="93" y2="44" stroke="#555" strokeWidth="2.5" />
        </g>
      )}
      {accessory === 'crown' && (
        <g>
          <polygon
            points="30,36 40,12 52,26 60,10 68,26 80,12 90,36"
            fill="#FFD700" stroke="#FFA500" strokeWidth="1.5" strokeLinejoin="round"
          />
          <circle cx="60" cy="16" r="3" fill="#FF6B6B" />
          <circle cx="40" cy="20" r="2.5" fill="#4ECDC4" />
          <circle cx="80" cy="20" r="2.5" fill="#4ECDC4" />
        </g>
      )}
    </svg>
  )
}

function getFace(mood) {
  // ברירת מחדל — חיוך עדין
  if (!mood) return {
    eyes: <>
      <circle cx="50" cy="46" r="4" fill="white" />
      <circle cx="70" cy="46" r="4" fill="white" />
      <circle cx="51.5" cy="47.5" r="2.5" fill="#333" />
      <circle cx="71.5" cy="47.5" r="2.5" fill="#333" />
      <circle cx="52.5" cy="46.5" r="1" fill="white" />
      <circle cx="72.5" cy="46.5" r="1" fill="white" />
    </>,
    mouth: <path d="M 50 60 Q 60 68 70 60" stroke="#555" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
  }

  if (mood === 1) return {
    eyes: <>
      <ellipse cx="50" cy="47" rx="4" ry="4.5" fill="white" />
      <ellipse cx="70" cy="47" rx="4" ry="4.5" fill="white" />
      <circle cx="50" cy="48.5" r="2.5" fill="#333" />
      <circle cx="70" cy="48.5" r="2.5" fill="#333" />
      {/* גבות עצובות */}
      <path d="M 44 39 Q 50 36 56 39" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 64 39 Q 70 36 76 39" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>,
    mouth: <path d="M 48 67 Q 60 59 72 67" stroke="#555" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
  }

  if (mood === 2) return {
    eyes: <>
      <circle cx="50" cy="46" r="4" fill="white" />
      <circle cx="70" cy="46" r="4" fill="white" />
      <circle cx="50" cy="47.5" r="2.5" fill="#333" />
      <circle cx="70" cy="47.5" r="2.5" fill="#333" />
      <path d="M 45 40 Q 50 38 55 40" stroke="#666" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 65 40 Q 70 38 75 40" stroke="#666" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>,
    mouth: <path d="M 50 65 Q 60 61 70 65" stroke="#555" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
  }

  if (mood === 3) return {
    eyes: <>
      <circle cx="50" cy="46" r="4" fill="white" />
      <circle cx="70" cy="46" r="4" fill="white" />
      <circle cx="51" cy="47" r="2.5" fill="#333" />
      <circle cx="71" cy="47" r="2.5" fill="#333" />
      <circle cx="52" cy="46" r="1" fill="white" />
      <circle cx="72" cy="46" r="1" fill="white" />
    </>,
    mouth: <line x1="50" y1="63" x2="70" y2="63" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />,
  }

  if (mood === 4) return {
    eyes: <>
      <circle cx="50" cy="46" r="4" fill="white" />
      <circle cx="70" cy="46" r="4" fill="white" />
      <circle cx="51" cy="46.5" r="2.5" fill="#333" />
      <circle cx="71" cy="46.5" r="2.5" fill="#333" />
      <circle cx="52" cy="45.5" r="1" fill="white" />
      <circle cx="72" cy="45.5" r="1" fill="white" />
    </>,
    mouth: <path d="M 48 61 Q 60 70 72 61" stroke="#555" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
  }

  // mood === 5
  return {
    eyes: <>
      {/* עיניים קמורות - עצומות מאושר */}
      <path d="M 44 45 Q 50 40 56 45" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 64 45 Q 70 40 76 45" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>,
    mouth: <>
      <path d="M 45 60 Q 60 75 75 60" stroke="#333" strokeWidth="3" fill="#FF8FAB" strokeLinecap="round" />
      <path d="M 49 64 Q 60 72 71 64" fill="white" />
    </>,
  }
}
