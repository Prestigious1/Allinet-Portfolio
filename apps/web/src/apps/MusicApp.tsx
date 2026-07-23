'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createOSApp } from '@/core/registry/AppRegistry'
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react'

function MusicAppComponent() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const duration = 240 // 4 mins placeholder
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Placeholder tracks
  const tracks = [
    { title: 'Cyber City Nights', artist: 'ALLINET Audio', duration: '4:00' },
    { title: 'Deep Focus (Flow State)', artist: 'ALLINET Audio', duration: '6:30' },
    { title: 'Terminal Hack', artist: 'ALLINET Audio', duration: '2:45' },
  ]

  // Simulate audio visualizer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const bars = 40
      const barWidth = canvas.width / bars
      
      for (let i = 0; i < bars; i++) {
        // Random height if playing, static low height if paused
        const height = isPlaying 
          ? Math.max(10, Math.random() * (canvas.height - 10))
          : 10
          
        // Gradient color
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0)
        gradient.addColorStop(0, '#9333EA') // Purple
        gradient.addColorStop(1, '#D4AF37') // Gold

        ctx.fillStyle = gradient
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height)
      }

      if (isPlaying) {
        animationId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isPlaying])

  // Simulate progress
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime(prev => (prev >= duration ? 0 : prev + 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full h-full bg-[#050014] text-white flex flex-col font-sans">
      <div className="h-48 w-full bg-black/40 relative border-b border-white/10 flex-shrink-0">
        <canvas 
          ref={canvasRef}
          width={800} 
          height={192} 
          className="absolute inset-0 w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050014] to-transparent pointer-events-none" />
        
        <div className="absolute bottom-6 left-6 z-10 flex gap-6 items-end">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-900 rounded-lg shadow-2xl flex items-center justify-center border border-white/20">
            <span className="text-3xl font-bold text-white/50">A</span>
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-gold mb-1 uppercase">Now Playing</div>
            <h2 className="text-3xl font-bold">{tracks[0].title}</h2>
            <p className="text-gray-400">{tracks[0].artist}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-8">
          <div className="w-full h-1 bg-white/10 rounded-full mb-2 cursor-pointer group">
            <div 
              className="h-full bg-gold rounded-full relative group-hover:bg-yellow-400 transition-colors"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transform translate-x-1/2 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 mb-10">
          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipBack size={24} />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current ml-1" />}
          </button>
          
          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipForward size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <h3 className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Up Next</h3>
          <div className="space-y-1">
            {tracks.map((track, idx) => (
              <div 
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  idx === 0 ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded flex items-center justify-center font-mono text-xs opacity-50 bg-black/30">
                    {idx === 0 && isPlaying ? (
                      <div className="flex gap-0.5">
                        <div className="w-1 h-3 bg-gold animate-pulse" />
                        <div className="w-1 h-4 bg-gold animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-2 bg-gold animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${idx === 0 ? 'text-gold' : ''}`}>{track.title}</div>
                    <div className="text-xs opacity-60">{track.artist}</div>
                  </div>
                </div>
                <div className="text-xs font-mono opacity-60">{track.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default createOSApp({
  id: 'music',
  title: 'Music',
  icon: 'music',
  canFullscreen: true,
  defaultWidth: 450,
  defaultHeight: 700
}, MusicAppComponent)
