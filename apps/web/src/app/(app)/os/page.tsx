'use client'

import React, { useEffect, useState } from 'react'
import { useOSStore } from '@/store/os.store'
import Desktop from '@/components/os/Desktop'
import BootSequence from '@/components/boot/BootSequence'
import IntroScene from '@/components/three/IntroScene'
import dynamic from 'next/dynamic'
import { services } from '@/core/providers'

const DynamicIntroScene = dynamic(() => import('@/components/three/IntroScene'), { ssr: false })

export default function OSPage() {
  const { isBooting, finishBoot, setSystemApps } = useOSStore()
  const [showIntro, setShowIntro] = useState(false)

  // Fetch dynamic apps
  useEffect(() => {
    services.portfolio.getDesktopApps().then((apps) => {
      if (apps && apps.length > 0) {
        setSystemApps(apps)
      }
    })
  }, [setSystemApps])

  const handleBootComplete = () => {
    setShowIntro(true)
  }

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem('allinet-booted', 'true')
    } catch (e) {}
    finishBoot()
  }

  // Skip boot sequence if already booted in this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem('allinet-booted') === 'true') {
        finishBoot()
      }
    } catch (e) {}
  }, [finishBoot])

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* 3D Intro sequence overlay */}
      {showIntro && isBooting && (
        <div className="absolute inset-0 z-50">
          <DynamicIntroScene onComplete={handleIntroComplete} />
        </div>
      )}

      {/* Boot sequence overlay */}
      {isBooting && !showIntro && (
        <div className="absolute inset-0 z-[60]">
          <BootSequence onComplete={handleBootComplete} />
        </div>
      )}

      {/* Main OS Desktop (always mounted underneath for seamless reveal) */}
      <div className="absolute inset-0 z-0">
        <Desktop />
      </div>
    </main>
  )
}
