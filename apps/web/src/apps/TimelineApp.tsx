'use client'

import React, { useEffect, useState } from 'react'
import { createOSApp } from '@/core/registry/AppRegistry'
import { services } from '@/core/providers'
import { ExperienceData } from '@/core/providers/portfolio/PortfolioProvider'

function TimelineAppComponent() {
  const [experiences, setExperiences] = useState<ExperienceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    services.portfolio.getExperience().then(data => {
      setExperiences(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-8 text-white">Initializing timeline...</div>
  }

  return (
    <div className="w-full h-full bg-[#050014] text-white p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">Journey Timeline</h1>
        
        <div className="relative border-l-2 border-purple-900 ml-4 md:ml-0 md:pl-0">
          {experiences.map((event, index) => (
            <div key={index} className="mb-10 ml-6 md:ml-8 relative group">
              <div className="absolute -left-[35px] md:-left-[41px] top-1 w-6 h-6 rounded-full bg-[#050014] border-4 border-purple-500 group-hover:border-gold transition-colors shadow-[0_0_10px_rgba(147,51,234,0.5)] z-10" />
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-purple-500/30 transition-colors">
                <span className="text-gold font-mono text-sm font-bold tracking-wider mb-2 block">
                  {event.startDate} {event.endDate ? `- ${event.endDate}` : '(Current)'}
                </span>
                <h3 className="text-xl font-bold mb-2 text-white">{event.role} at {event.company}</h3>
                <p className="text-gray-400 mb-4">{event.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {(event.techStack || []).map(tech => (
                    <span key={tech as string} className="text-xs bg-white/10 px-2 py-1 rounded text-purple-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {experiences.length === 0 && (
            <div className="text-gray-500 ml-8">No journey data found.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default createOSApp({
  id: 'timeline',
  title: 'Timeline',
  icon: 'clock',
  canFullscreen: true,
  defaultWidth: 800,
  defaultHeight: 600
}, TimelineAppComponent)
