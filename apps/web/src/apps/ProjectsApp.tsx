'use client'

import React, { useState, useEffect } from 'react'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { ProjectData } from '@/core/providers/portfolio/PortfolioProvider'
import ImageViewer from '@/components/shared/ImageViewer'

function ProjectsAppComponent() {
  const [filter, setFilter] = useState('All')
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  useEffect(() => {
    services.portfolio.getProjects().then(data => {
      setProjects(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const categories = ['All', 'AI', 'Frontend', 'Cloud', 'Backend']
  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter(p => (p.category || []).includes(filter))

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gold animate-pulse">Loading Projects...</div>
  }

  // Helper to extract YouTube ID for embed
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null
  }

  if (selectedProject) {
    const videoEmbedUrl = selectedProject.videoUrl ? getYouTubeEmbedUrl(selectedProject.videoUrl) : null;
    
    return (
      <div className="w-full h-full bg-[#050014] text-white p-8 overflow-y-auto">
        <button 
          onClick={() => setSelectedProject(null)}
          className="text-purple-400 hover:text-white mb-6 flex items-center transition-colors font-mono text-sm uppercase tracking-wider"
        >
          <span className="mr-2">←</span> Back to Projects
        </button>

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl font-bold font-sans tracking-tight text-white">{selectedProject.title}</h1>
              {selectedProject.status && (
                <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold">
                  {selectedProject.status}
                </span>
              )}
            </div>
            
            <p className="text-xl text-purple-200/80 mb-6 font-light">{selectedProject.tagline}</p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {(selectedProject.techStack || []).map((t: string) => (
                <span key={t} className="text-xs uppercase font-mono tracking-wider px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded text-purple-300">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex gap-4">
              {selectedProject.demoUrl && (
                <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
                  Live Demo ↗
                </a>
              )}
              {selectedProject.repoUrl && (
                <a href={selectedProject.repoUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-white/20 rounded bg-white/5 hover:bg-white/10 transition-colors font-mono text-sm">
                  Source Code ↗
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {selectedProject.description && (
            <div className="prose prose-invert prose-purple max-w-none mb-12">
              <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">About the Project</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {typeof selectedProject.description === 'string' ? selectedProject.description : JSON.stringify(selectedProject.description)}
              </p>
            </div>
          )}

          {/* Media Gallery */}
          {(videoEmbedUrl || (selectedProject.gallery && selectedProject.gallery.length > 0)) && (
            <div>
              <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-2">Media Gallery</h3>
              
              {/* Video Player */}
              {videoEmbedUrl && (
                <div className="mb-8 rounded-xl overflow-hidden border border-white/10 aspect-video bg-black">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={videoEmbedUrl} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Image Grid */}
              {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedProject.gallery.map((media, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-video">
                      <img 
                        src={media.url} 
                        alt={media.alt || 'Gallery image'} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(media.url);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <ImageViewer 
          src={lightboxImage} 
          onClose={() => setLightboxImage(null)} 
        />
      </div>
    )
  }

  return (
    <div className="w-full h-full text-white p-6 flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <h2 className="text-2xl font-bold font-sans tracking-wide">Project Portfolio</h2>
        <div className="flex space-x-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === cat 
                  ? 'bg-purple-500/30 border-purple-500 text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]'
                  : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
        {filteredProjects.map((project, idx) => (
          <div 
            key={project.slug || idx} 
            onClick={() => setSelectedProject(project)}
            className="group relative glassmorphism rounded-xl border border-white/10 overflow-hidden hover:border-gold/50 transition-all duration-300 flex flex-col h-72 cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)]"
          >
            {/* Project Image */}
            <div className="h-32 w-full bg-gradient-to-br from-black to-purple-900/40 relative overflow-hidden flex-shrink-0">
              {project.coverImage?.url ? (
                <img 
                  src={project.coverImage.url} 
                  alt={project.coverImage.alt || project.title} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMzMzMiLz4KPC9zdmc+')] opacity-30 group-hover:opacity-10 transition-opacity" />
              )}
            </div>

            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gold-light group-hover:text-gold transition-colors">{project.title}</h3>
                {project.status && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-gold/10 border border-gold/20 rounded text-gold/70 shrink-0 ml-2">
                    {project.status}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-white/70 line-clamp-3 mb-4 flex-1">
                {project.tagline}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {(project.techStack || []).map((t: string) => (
                  <span key={t} className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/50">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Hover overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
      
      {filteredProjects.length === 0 && (
        <div className="w-full py-12 flex items-center justify-center text-white/30 font-mono">
          No projects found.
        </div>
      )}
    </div>
  )
}


export default createOSApp({
  id: 'projects',
  title: 'Projects',
  icon: 'code',
  canFullscreen: true,
  defaultWidth: 1000,
  defaultHeight: 700,
}, ProjectsAppComponent)
