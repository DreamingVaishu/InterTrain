export function UserAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size];

  return (
    <div
      className={`relative ${sizeClasses} rounded-full bg-gradient-to-tr from-[#eceeed] to-[#ffffff] border border-neutral-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner`}
      title="Billu badmash"
    >
      {/* Illustrated character avatar matching the screenshot */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Soft background */}
        <circle cx="50" cy="50" r="48" fill="#F4F4F6" />
        
        {/* Hair / Beret cap */}
        <path d="M22,38 Q32,15 65,22 Q82,27 82,45 C78,42 70,38 58,40 C44,42 32,48 22,38 Z" fill="#3D3B43" />
        <circle cx="28" cy="28" r="7" fill="#3D3B43" />
        
        {/* Face */}
        <circle cx="50" cy="58" r="30" fill="#FAF5ED" />
        
        {/* Cheeks blush */}
        <ellipse cx="38" cy="64" rx="4" ry="2.5" fill="#FFB4B4" opacity="0.6" />
        <ellipse cx="64" cy="64" rx="4" ry="2.5" fill="#FFB4B4" opacity="0.6" />
        
        {/* Eyes */}
        <circle cx="42" cy="56" r="3" fill="#222" />
        <circle cx="60" cy="56" r="3" fill="#222" />
        
        {/* Cat nose & playful smirk */}
        <polygon points="51,61 48,64 54,64" fill="#E88" />
        <path d="M48,65 Q51,68 54,65" stroke="#222" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Collar / shirt */}
        <path d="M30,85 Q50,96 70,85 L75,100 L25,100 Z" fill="#4B6B94" />
      </svg>
    </div>
  );
}
