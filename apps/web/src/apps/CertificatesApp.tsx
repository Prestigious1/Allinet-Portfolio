'use client'

import React from 'react'
import { createOSApp } from '@/core/registry/AppRegistry'

function CertificatesAppComponent() {
  return (
    <div className="w-full h-full bg-[#050014] text-white p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Certificates</h1>
        <p className="text-gray-400">Loading certificates...</p>
      </div>
    </div>
  )
}

export default createOSApp({
  id: 'certificates',
  title: 'Certificates',
  icon: 'award',
  canFullscreen: true,
  defaultWidth: 800,
  defaultHeight: 600
}, CertificatesAppComponent)
