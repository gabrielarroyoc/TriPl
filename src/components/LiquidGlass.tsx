import React, { useRef, useState, useEffect } from 'react'

interface LiquidGlassProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  refractionStrength?: number // Strength of refraction displacement
  frostedIntensity?: number // Blur amount
  tintColor?: string // Layer background color
  interactive?: boolean // React to mouse movement
}

export function LiquidGlass({
  children,
  className = '',
  contentClassName = '',
  refractionStrength = 20,
  frostedIntensity = 16,
  tintColor = 'rgba(255, 255, 255, 0.05)',
  interactive = true,
}: LiquidGlassProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [filterId] = useState(() => `liquid-glass-filter-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      setMousePos({ x, y })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [interactive])

  const scale = refractionStrength
  const xDisplace = (mousePos.x - 0.5) * scale
  const yDisplace = (mousePos.y - 0.5) * scale

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl border border-white/20 dark:border-white/10 ${className}`}
      style={{
        background: tintColor,
        boxShadow: `
          0 8px 32px 0 rgba(0, 0, 0, 0.2),
          inset 0 1px 1px rgba(255, 255, 255, 0.2),
          inset 0 -1px 2px rgba(0, 0, 0, 0.2)
        `,
      }}
    >
      {/* 1. Backdrop Glass and Refractive Blur Layer */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none rounded-[inherit]"
        style={{
          backdropFilter: `blur(${frostedIntensity}px) saturate(160%)`,
          WebkitBackdropFilter: `blur(${frostedIntensity}px) saturate(160%)`,
          filter: `url(#${filterId})`,
        }}
      />

      {/* SVG Turbulence for Background Refraction Distortion only */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.005 0.01"
              numOctaves="3"
              result="noise"
            />
            <feOffset dx={xDisplace * 0.4} dy={yDisplace * 0.4} in="noise" result="offsetNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="offsetNoise"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 2. Soft Highlight Overlay (Convex Glass Effect) */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-70 rounded-[inherit]"
        style={{
          background: `radial-gradient(
            circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, 
            rgba(255, 255, 255, 0.15) 0%, 
            rgba(255, 255, 255, 0.02) 50%, 
            transparent 80%
          )`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* 3. Rim Reflection Highlight */}
      <div
        className="absolute inset-0 pointer-events-none z-10 rounded-[inherit]"
        style={{
          background: `linear-gradient(
            ${135 + (mousePos.x - 0.5) * 20}deg,
            rgba(255, 255, 255, 0.12) 0%,
            transparent 60%,
            rgba(255, 255, 255, 0.03) 100%
          )`,
        }}
      />

      {/* 4. Completely Clean, Readable Content (No distortion on text or icons) */}
      <div className={`relative z-20 h-full w-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  )
}
