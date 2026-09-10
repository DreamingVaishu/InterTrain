export function GraduationWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-10 w-[420px] lg:w-[620px] h-[520px] lg:h-[720px] opacity-25 select-none overflow-hidden"
    >
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full text-neutral-300 fill-current transform rotate-[-6deg] translate-x-12 translate-y-4"
      >
        {/* Diamond cap top */}
        <polygon points="300,100 550,220 300,340 50,220" />
        
        {/* Cap skull cap under base */}
        <path d="M160,280 L160,400 Q300,480 440,400 L440,280 Q300,350 160,280 Z" />
        
        {/* Tassel loop & knot */}
        <circle cx="300" cy="220" r="16" />
        <path d="M300,220 Q440,240 480,330 L480,430 L465,430 L465,335 Q430,250 300,228 Z" />
        <rect x="455" y="430" width="30" height="40" rx="4" />
      </svg>
    </div>
  );
}
