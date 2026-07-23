'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function AmbientEffects() {
  const containerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Disable intensive effects on mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    // Cursor Glow
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        // Use translate3d for GPU acceleration
        glowRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      }
    }

    // Parallax background (subtle movement based on cursor)
    const handleParallax = (e: MouseEvent) => {
      if (!containerRef.current) return
      const x = (e.clientX / window.innerWidth - 0.5) * 10
      const y = (e.clientY / window.innerHeight - 0.5) * 10
      containerRef.current.style.transform = `translate3d(${-x}px, ${-y}px, 0)`
    }

    // Dust particles
    const particles: HTMLDivElement[] = []
    const particleCount = 20
    
    if (containerRef.current) {
      for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div')
        p.className = 'dust-particle'
        p.style.width = `${Math.random() * 3 + 1}px`
        p.style.height = p.style.width
        p.style.left = `${Math.random() * 100}vw`
        p.style.top = `${Math.random() * 100}vh`
        
        // Randomize animation duration and delay
        const duration = Math.random() * 10 + 10
        const delay = Math.random() * 5
        
        p.animate([
          { transform: 'translateY(0) translateX(0)', opacity: 0 },
          { opacity: Math.random() * 0.3 + 0.1, offset: 0.2 },
          { opacity: 0, offset: 0.8 },
          { transform: `translateY(-${Math.random() * 100 + 50}px) translateX(${Math.random() * 50 - 25}px)`, opacity: 0 }
        ], {
          duration: duration * 1000,
          delay: delay * 1000,
          iterations: Infinity,
          easing: 'linear'
        })
        
        containerRef.current.appendChild(p)
        particles.push(p)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousemove', handleParallax, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousemove', handleParallax)
      particles.forEach(p => p.remove())
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Container for parallax elements */}
      <div 
        ref={containerRef}
        className="absolute inset-[-20px] transition-transform duration-[200ms] ease-out will-change-transform"
      />
      {/* Cursor Radial Glow */}
      <div 
        ref={glowRef}
        className="cursor-glow"
      />
    </div>
  )
}
