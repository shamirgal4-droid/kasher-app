import { useEffect, useRef } from 'react'

// פרצוף מונפש לכל מצב רוח
export default function AnimatedFace({ mood, size = 80, selected = false }) {
  const faces = {
    1: <SadFace size={size} />,
    2: <SlightlySadFace size={size} />,
    3: <NeutralFace size={size} />,
    4: <HappyFace size={size} />,
    5: <VeryHappyFace size={size} />,
  }

  return (
    <div
      className={`relative transition-transform duration-200 ${selected ? 'scale-125' : 'hover:scale-110'}`}
      style={{ width: size, height: size }}
    >
      {faces[mood]}
    </div>
  )
}

// ---- פרצוף עצוב מאוד ----
function SadFace({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <style>{`
        @keyframes tear1 {
          0%   { transform: translateY(0); opacity: 1; }
          80%  { transform: translateY(18px); opacity: 0.7; }
          100% { transform: translateY(22px); opacity: 0; }
        }
        @keyframes tear2 {
          0%   { transform: translateY(0); opacity: 0; }
          20%  { opacity: 1; }
          90%  { transform: translateY(18px); opacity: 0.7; }
          100% { transform: translateY(22px); opacity: 0; }
        }
        @keyframes eyebrow-sad {
          0%, 100% { transform: rotate(0deg); }
          50%       { transform: rotate(0deg) translateY(-1px); }
        }
        @keyframes sad-body {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(2px); }
        }
      `}</style>

      {/* פנים */}
      <circle cx="50" cy="50" r="46" fill="#FFD93D" stroke="#F5C518" strokeWidth="2" />

      {/* גבות עצובות */}
      <g style={{ animation: 'eyebrow-sad 3s ease-in-out infinite' }}>
        <path d="M 28 30 Q 36 26 44 30" stroke="#5C4A1E" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 56 30 Q 64 26 72 30" stroke="#5C4A1E" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      {/* עיניים */}
      <circle cx="36" cy="42" r="5.5" fill="#5C4A1E" />
      <circle cx="64" cy="42" r="5.5" fill="#5C4A1E" />
      {/* ברק בעיניים */}
      <circle cx="38" cy="40" r="2" fill="white" />
      <circle cx="66" cy="40" r="2" fill="white" />

      {/* פה עצוב */}
      <path d="M 34 68 Q 50 58 66 68" stroke="#5C4A1E" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* דמעות */}
      <ellipse cx="36" cy="50" rx="3" ry="4" fill="#74C0FC"
        style={{ animation: 'tear1 2s ease-in infinite' }} />
      <ellipse cx="64" cy="50" rx="3" ry="4" fill="#74C0FC"
        style={{ animation: 'tear2 2s ease-in 0.7s infinite' }} />

      {/* גוף מתנדנד */}
      <g style={{ animation: 'sad-body 3s ease-in-out infinite', transformOrigin: '50px 50px' }}>
      </g>
    </svg>
  )
}

// ---- פרצוף עצוב קצת ----
function SlightlySadFace({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <style>{`
        @keyframes slight-sigh {
          0%, 100% { transform: scaleY(1); }
          50%       { transform: scaleY(0.97); }
        }
        @keyframes eyedrop {
          0%, 70%, 100% { transform: translateY(0); }
          85%            { transform: translateY(1.5px); }
        }
      `}</style>

      <circle cx="50" cy="50" r="46" fill="#FFD93D" stroke="#F5C518" strokeWidth="2"
        style={{ animation: 'slight-sigh 4s ease-in-out infinite', transformOrigin: '50px 50px' }} />

      {/* גבות מעט עצובות */}
      <path d="M 28 33 Q 36 30 44 33" stroke="#5C4A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 56 33 Q 64 30 72 33" stroke="#5C4A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* עיניים */}
      <ellipse cx="36" cy="43" rx="5" ry="5.5" fill="#5C4A1E"
        style={{ animation: 'eyedrop 4s ease-in-out infinite' }} />
      <ellipse cx="64" cy="43" rx="5" ry="5.5" fill="#5C4A1E"
        style={{ animation: 'eyedrop 4s ease-in-out 0.5s infinite' }} />
      <circle cx="38" cy="41" r="1.8" fill="white" />
      <circle cx="66" cy="41" r="1.8" fill="white" />

      {/* פה - קצת עצוב */}
      <path d="M 36 67 Q 50 61 64 67" stroke="#5C4A1E" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* לחיים ורודות */}
      <circle cx="26" cy="58" r="7" fill="#FFB5C8" opacity="0.5" />
      <circle cx="74" cy="58" r="7" fill="#FFB5C8" opacity="0.5" />
    </svg>
  )
}

// ---- פרצוף ניטרלי ----
function NeutralFace({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <style>{`
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.1); }
        }
        @keyframes neutral-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-2px); }
        }
      `}</style>

      <circle cx="50" cy="50" r="46" fill="#FFD93D" stroke="#F5C518" strokeWidth="2"
        style={{ animation: 'neutral-float 3.5s ease-in-out infinite', transformOrigin: '50px 50px' }} />

      {/* גבות ישרות */}
      <path d="M 28 34 Q 36 33 44 34" stroke="#5C4A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 56 34 Q 64 33 72 34" stroke="#5C4A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* עיניים עם עיפעוף */}
      <ellipse cx="36" cy="44" rx="5" ry="5" fill="#5C4A1E"
        style={{ animation: 'blink 4s ease-in-out infinite', transformOrigin: '36px 44px' }} />
      <ellipse cx="64" cy="44" rx="5" ry="5" fill="#5C4A1E"
        style={{ animation: 'blink 4s ease-in-out 0.1s infinite', transformOrigin: '64px 44px' }} />
      <circle cx="38" cy="42" r="1.8" fill="white" />
      <circle cx="66" cy="42" r="1.8" fill="white" />

      {/* פה ישר */}
      <path d="M 36 66 L 64 66" stroke="#5C4A1E" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ---- פרצוף שמח ----
function HappyFace({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <style>{`
        @keyframes happy-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          40%       { transform: translateY(-4px) scale(1.02); }
          60%       { transform: translateY(-2px) scale(1.01); }
        }
        @keyframes happy-eye {
          0%, 80%, 100% { transform: scaleY(1); }
          90%            { transform: scaleY(0.15); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%       { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <circle cx="50" cy="50" r="46" fill="#FFD93D" stroke="#F5C518" strokeWidth="2"
        style={{ animation: 'happy-bounce 2.5s ease-in-out infinite', transformOrigin: '50px 50px' }} />

      {/* גבות שמחות */}
      <path d="M 28 33 Q 36 28 44 33" stroke="#5C4A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 56 33 Q 64 28 72 33" stroke="#5C4A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* עיניים */}
      <ellipse cx="36" cy="43" rx="5" ry="5" fill="#5C4A1E"
        style={{ animation: 'happy-eye 3s ease-in-out infinite', transformOrigin: '36px 43px' }} />
      <ellipse cx="64" cy="43" rx="5" ry="5" fill="#5C4A1E"
        style={{ animation: 'happy-eye 3s ease-in-out 0.15s infinite', transformOrigin: '64px 43px' }} />
      <circle cx="38" cy="41" r="2" fill="white" />
      <circle cx="66" cy="41" r="2" fill="white" />

      {/* פה שמח */}
      <path d="M 34 60 Q 50 74 66 60" stroke="#5C4A1E" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* לחיים */}
      <circle cx="25" cy="57" r="7" fill="#FF8FAB" opacity="0.5" />
      <circle cx="75" cy="57" r="7" fill="#FF8FAB" opacity="0.5" />

      {/* ניצוצות */}
      <text x="78" y="30" fontSize="12" style={{ animation: 'sparkle 2s ease-in-out infinite' }}>✨</text>
      <text x="12" y="35" fontSize="10" style={{ animation: 'sparkle 2s ease-in-out 0.7s infinite' }}>⭐</text>
    </svg>
  )
}

// ---- פרצוף שמח מאוד ----
function VeryHappyFace({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <style>{`
        @keyframes super-bounce {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          25%       { transform: translateY(-6px) scale(1.04) rotate(-2deg); }
          75%       { transform: translateY(-4px) scale(1.03) rotate(2deg); }
        }
        @keyframes star-spin {
          0%   { transform: rotate(0deg) scale(0.8); opacity: 0.6; }
          50%  { transform: rotate(180deg) scale(1.2); opacity: 1; }
          100% { transform: rotate(360deg) scale(0.8); opacity: 0.6; }
        }
        @keyframes heart-pop {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%       { transform: scale(1.3); opacity: 1; }
        }
        @keyframes squint {
          0%, 70%, 100% { transform: scaleY(1); }
          85%            { transform: scaleY(0.1); }
        }
      `}</style>

      {/* עיגול זוהר */}
      <circle cx="50" cy="50" r="48" fill="#FFE566" opacity="0.4"
        style={{ animation: 'heart-pop 1.8s ease-in-out infinite', transformOrigin: '50px 50px' }} />

      <circle cx="50" cy="50" r="46" fill="#FFD93D" stroke="#F5C518" strokeWidth="2"
        style={{ animation: 'super-bounce 1.8s ease-in-out infinite', transformOrigin: '50px 50px' }} />

      {/* גבות שמחות מאוד */}
      <path d="M 26 31 Q 36 24 44 31" stroke="#5C4A1E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 56 31 Q 64 24 74 31" stroke="#5C4A1E" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* עיניים שמחות מאוד - קמורות */}
      <path d="M 29 41 Q 36 35 43 41" stroke="#5C4A1E" strokeWidth="3.5" fill="none" strokeLinecap="round"
        style={{ animation: 'squint 3s ease-in-out infinite', transformOrigin: '36px 41px' }} />
      <path d="M 57 41 Q 64 35 71 41" stroke="#5C4A1E" strokeWidth="3.5" fill="none" strokeLinecap="round"
        style={{ animation: 'squint 3s ease-in-out 0.1s infinite', transformOrigin: '64px 41px' }} />

      {/* פה - חיוך ענק */}
      <path d="M 28 60 Q 50 80 72 60" stroke="#5C4A1E" strokeWidth="4" fill="#FF6B6B" strokeLinecap="round" />
      {/* שיניים */}
      <path d="M 32 64 Q 50 76 68 64" fill="white" />

      {/* לחיים */}
      <circle cx="22" cy="60" r="8" fill="#FF8FAB" opacity="0.6" />
      <circle cx="78" cy="60" r="8" fill="#FF8FAB" opacity="0.6" />

      {/* כוכבים מסתובבים */}
      <text x="76" y="26" fontSize="14"
        style={{ animation: 'star-spin 2s linear infinite', transformOrigin: '83px 19px' }}>⭐</text>
      <text x="8" y="30" fontSize="13"
        style={{ animation: 'star-spin 2.5s linear infinite reverse', transformOrigin: '15px 23px' }}>✨</text>
      <text x="82" y="70" fontSize="11"
        style={{ animation: 'heart-pop 1.5s ease-in-out 0.3s infinite', transformOrigin: '87px 65px' }}>💛</text>
      <text x="4" y="72" fontSize="11"
        style={{ animation: 'heart-pop 1.5s ease-in-out 0.8s infinite', transformOrigin: '9px 67px' }}>🌟</text>
    </svg>
  )
}
