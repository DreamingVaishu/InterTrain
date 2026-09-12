import React from 'react';

interface RobotAssistantProps {
  className?: string;
  size?: number;
  withLaptop?: boolean;
}

export function RobotAssistant({ className = '', size = 260, withLaptop = false }: RobotAssistantProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* hello */}
      {/* Ambient Blue Radial Glow Behind Robot */}
      <div className="absolute inset-0 rounded-full bg-blue-500/15 blur-2xl transform scale-90 pointer-events-none" />

      <svg
        viewBox="0 0 320 320"
        className="w-full h-full drop-shadow-xl overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Head & Body Gradients */}
          <linearGradient id="headWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#EEF2F6" />
            <stop offset="100%" stopColor="#D9E2EC" />
          </linearGradient>

          <linearGradient id="visorDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B111E" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          <linearGradient id="cyanEyeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <linearGradient id="earphonesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <linearGradient id="blueAccentRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <filter id="softBlueGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- ROBOT CHEST & TORSO --- */}
        <g id="torso">
          {/* Shoulders */}
          <path
            d="M80 260 C80 235, 110 225, 160 225 C210 225, 240 235, 240 260 L260 320 L60 320 Z"
            fill="url(#headWhiteGrad)"
            stroke="#CBD5E1"
            strokeWidth="2"
          />
          {/* Left Arm Socket */}
          <ellipse cx="65" cy="275" rx="18" ry="24" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <circle cx="65" cy="275" r="8" fill="#2563EB" opacity="0.85" />

          {/* Right Arm Socket */}
          <ellipse cx="255" cy="275" rx="18" ry="24" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <circle cx="255" cy="275" r="8" fill="#2563EB" opacity="0.85" />

          {/* Chest Center Plate */}
          <path
            d="M115 250 Q160 258 205 250 L200 310 Q160 316 120 310 Z"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />

          {/* InterTrain Logo on Chest */}
          <g transform="translate(160, 275) scale(0.85)">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill="#0F172A" />
            {/* Mortarboard icon */}
            <path
              d="M-22 -2 L-14 -6 L-6 -2 L-14 2 Z"
              fill="#38BDF8"
            />
            <path
              d="M-20 0 L-20 4 C-17 6 -11 6 -8 4 L-8 0"
              stroke="#38BDF8"
              strokeWidth="1.2"
              fill="none"
            />
            <text
              x="-4"
              y="4"
              fill="#FFFFFF"
              fontSize="8.5"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              InterTrain
            </text>
          </g>

          {/* Collar / Neck joint */}
          <rect x="135" y="210" width="50" height="20" rx="8" fill="#64748B" />
          <line x1="140" y1="216" x2="180" y2="216" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="140" y1="222" x2="180" y2="222" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* --- ROBOT HEAD & EARS --- */}
        <g id="head">
          {/* Left Ear / Headphone Cup */}
          <g id="left-ear">
            <rect x="36" y="115" width="22" height="60" rx="10" fill="url(#earphonesGrad)" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx="47" cy="145" r="16" fill="#0B111E" />
            <circle cx="47" cy="145" r="11" fill="none" stroke="url(#blueAccentRing)" strokeWidth="3" filter="url(#softBlueGlow)" />
            <circle cx="47" cy="145" r="5" fill="#38BDF8" />
          </g>

          {/* Right Ear / Headphone Cup */}
          <g id="right-ear">
            <rect x="262" y="115" width="22" height="60" rx="10" fill="url(#earphonesGrad)" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx="273" cy="145" r="16" fill="#0B111E" />
            <circle cx="273" cy="145" r="11" fill="none" stroke="url(#blueAccentRing)" strokeWidth="3" filter="url(#softBlueGlow)" />
            <circle cx="273" cy="145" r="5" fill="#38BDF8" />
          </g>

          {/* Headphone Band Arch over head */}
          <path
            d="M48 125 C48 45, 272 45, 272 125"
            fill="none"
            stroke="url(#earphonesGrad)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M80 72 C120 54, 200 54, 240 72"
            fill="none"
            stroke="#2563EB"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Main White Helmet Shell */}
          <rect
            x="52"
            y="70"
            width="216"
            height="150"
            rx="64"
            fill="url(#headWhiteGrad)"
            stroke="#CBD5E1"
            strokeWidth="2.5"
          />

          {/* Sleek Dark Face Visor Screen */}
          <rect
            x="76"
            y="95"
            width="168"
            height="100"
            rx="42"
            fill="url(#visorDarkGrad)"
            stroke="#1E293B"
            strokeWidth="2"
          />

          {/* Visor Glass Highlight reflection */}
          <path
            d="M92 110 C120 100, 180 100, 228 112 C210 106, 110 106, 92 110 Z"
            fill="#FFFFFF"
            opacity="0.25"
          />

          {/* --- FRIENDLY GLOWING BLUE EYES --- */}
          <g id="eyes" filter="url(#softBlueGlow)">
            {/* Left Eye - Arching Happy Eye */}
            <path
              d="M104 148 C104 133, 136 133, 136 148 C136 153, 104 153, 104 148 Z"
              fill="url(#cyanEyeGlow)"
            />
            <ellipse cx="120" cy="142" rx="14" ry="9" fill="#38BDF8" />
            <circle cx="123" cy="140" r="3.5" fill="#FFFFFF" opacity="0.9" />

            {/* Right Eye - Arching Happy Eye */}
            <path
              d="M184 148 C184 133, 216 133, 216 148 C216 153, 184 153, 184 148 Z"
              fill="url(#cyanEyeGlow)"
            />
            <ellipse cx="200" cy="142" rx="14" ry="9" fill="#38BDF8" />
            <circle cx="203" cy="140" r="3.5" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Subtle Cute Robot Smile */}
          <path
            d="M150 166 Q160 173 170 166"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            filter="url(#softBlueGlow)"
            opacity="0.85"
          />

          {/* Cheek blush dots */}
          <circle cx="98" cy="156" r="4.5" fill="#0284C7" opacity="0.3" filter="url(#softBlueGlow)" />
          <circle cx="222" cy="156" r="4.5" fill="#0284C7" opacity="0.3" filter="url(#softBlueGlow)" />
        </g>

        {/* --- OPTIONAL LAPTOP IN FRONT OF ROBOT --- */}
        {withLaptop && (
          <g id="laptop-group" transform="translate(0, 20)">
            {/* Soft shadow underneath laptop */}
            <ellipse cx="160" cy="305" rx="100" ry="12" fill="#000000" opacity="0.2" filter="url(#softBlueGlow)" />

            {/* Laptop Base / Bottom edge */}
            <path
              d="M70 295 L250 295 L240 305 L80 305 Z"
              fill="#334155"
              stroke="#475569"
              strokeWidth="1.5"
            />

            {/* Laptop Screen Lid (Back facing viewer) */}
            <path
              d="M95 240 L225 240 L238 296 L82 296 Z"
              fill="url(#visorDarkGrad)"
              stroke="#475569"
              strokeWidth="1.8"
            />

            {/* Subtle Metallic Highlight on Lid */}
            <path
              d="M100 244 L220 244 L212 254 L108 254 Z"
              fill="#FFFFFF"
              opacity="0.08"
            />

            {/* InterTrain Logo Badge on Laptop Lid */}
            <g transform="translate(160, 268) scale(0.9)">
              <rect x="-38" y="-12" width="76" height="22" rx="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="1" />
              {/* Mortarboard icon */}
              <path
                d="M-28 -1 L-22 -4 L-16 -1 L-22 2 Z"
                fill="#38BDF8"
              />
              <path
                d="M-26 0.5 L-26 3.5 C-24 5 -20 5 -18 3.5 L-18 0.5"
                stroke="#38BDF8"
                strokeWidth="1"
                fill="none"
              />
              <text
                x="-12"
                y="3.5"
                fill="#FFFFFF"
                fontSize="8"
                fontWeight="bold"
                fontFamily="sans-serif"
                letterSpacing="0.3"
              >
                InterTrain
              </text>
            </g>

            {/* Robot Hands on the sides / typing */}
            {/* Left Hand */}
            <ellipse cx="78" cy="285" rx="12" ry="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" transform="rotate(-15 78 285)" />
            <circle cx="78" cy="285" r="4" fill="#38BDF8" opacity="0.6" />

            {/* Right Hand */}
            <ellipse cx="242" cy="285" rx="12" ry="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" transform="rotate(15 242 285)" />
            <circle cx="242" cy="285" r="4" fill="#38BDF8" opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
}

