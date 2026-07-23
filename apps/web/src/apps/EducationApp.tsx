'use client'

import React from 'react'
import { createOSApp } from '@/core/registry/AppRegistry'

function EducationAppComponent() {
  return (
    <div className="w-full h-full bg-[#050014] text-white p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Education</h1>
        <p className="text-gray-400">Loading education history...</p>
      </div>
    </div>
  )
}

export default createOSApp({
  id: 'education',
  title: 'Education',
  icon: 'graduation-cap',
  canFullscreen: true,
  defaultWidth: 800,
  defaultHeight: 600
}, EducationAppComponent)
