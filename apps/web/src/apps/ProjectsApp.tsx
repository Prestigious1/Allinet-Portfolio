'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { ProjectData } from '@/core/providers/portfolio/PortfolioProvider'
import { LuxuryImageModal } from '@/components/ui/LuxuryImageModal'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
}

function ProjectsAppComponent() {
  const [filter, setFilter] = useState('All')
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [activeLuxuryImage, setActiveLuxuryImage] = useState<{ url: string; title: string; subtitle: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    services.portfolio.getProjects()
      .then(data => { if (isMounted) { setProjects(data); setLoading(false) } })
      .catch(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  const categories = ['All', ...Array.from(new Set(projects.flatMap(p => p.category || [])))]
  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter(p => (p.category || []).includes(filter))

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gold font-mono animate-pulse">Loading projects...</div>
  }

  // Helper to extract YouTube ID for embed
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null
  }

  // ── Project Detail View ──
  if (selectedProject) {
    const videoEmbedUrl = selectedProject.videoUrl ? getYouTubeEmbedUrl(selectedProject.videoUrl) : null

    return (
      <div className="w-full h-full bg-[#050014]/90 text-white overflow-y-auto">
        {/* Hero Image */}
        {selectedProject.coverImage?.url && (
          <div
            className="relative w-full h-48 overflow-hidden cursor-zoom-in group/hero"
            onClick={() => setActiveLuxuryImage({
              url: selectedProject.coverImage!.url,
              title: selectedProject.title,
              subtitle: selectedProject.tagline || '',
            })}
          >
            <img
              src={selectedProject.coverImage.url}
              alt={selectedProject.title}
              className="w-full h-full object-cover group-hover/hero:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#050014]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity">
              <span className="bg-black/60 text-gold font-mono text-sm px-4 py-2 rounded-full border border-gold/40 backdrop-blur-sm">
                🔍 View Full Size
              </span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 text-white/50 hover:text-gold font-mono text-xs transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Projects
          </button>

          {/* Title Block */}
          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h1 className="text-3xl font-bold font-display gradient-brand-text leading-tight">{selectedProject.title}</h1>
              {selectedProject.status && (
                <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold shrink-0">
                  {selectedProject.status}
                </span>
              )}
            </div>
            {selectedProject.tagline && (
              <p className="text-purple-light font-mono text-sm mt-2 leading-relaxed">{selectedProject.tagline}</p>
            )}
            {(selectedProject.startDate || selectedProject.endDate) && (
              <p className="text-white/40 font-mono text-xs mt-1">
                {selectedProject.startDate} {selectedProject.endDate ? `– ${selectedProject.endDate}` : '– Present'}
              </p>
            )}
          </div>

          {/* Tech Stack */}
          {(selectedProject.techStack || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(selectedProject.techStack || []).map((t: string) => (
                <span key={t} className="tag-tech">{t}</span>
              ))}
            </div>
          )}

          {/* Action Links */}
          <div className="flex gap-3 flex-wrap">
            {selectedProject.demoUrl && (
              <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-gold text-xs px-5 py-2 flex items-center gap-1.5">
                <span>🚀</span> Live Demo ↗
              </a>
            )}
            {selectedProject.repoUrl && (
              <a href={selectedProject.repoUrl} target="_blank" rel="noopener noreferrer"
                className="px-5 py-2 border border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-mono text-xs flex items-center gap-1.5">
                <span>🐙</span> Source Code ↗
              </a>
            )}
          </div>

          {/* Description */}
          {selectedProject.description && (
            <div className="glassmorphism p-5 rounded-xl border border-white/10">
              <h3 className="text-xs font-mono text-gold uppercase tracking-wider mb-3">About the Project</h3>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                {typeof selectedProject.description === 'string' ? selectedProject.description : JSON.stringify(selectedProject.description)}
              </p>
            </div>
          )}

          {/* Metrics */}
          {selectedProject.metrics && (
            <div className="glassmorphism p-5 rounded-xl border border-white/10">
              <h3 className="text-xs font-mono text-gold uppercase tracking-wider mb-3">Impact Metrics</h3>
              <p className="text-sm text-white/80">{JSON.stringify(selectedProject.metrics)}</p>
            </div>
          )}

          {/* Video */}
          {videoEmbedUrl && (
            <div>
              <h3 className="text-xs font-mono text-gold uppercase tracking-wider mb-3">Demo Video</h3>
              <div className="rounded-xl overflow-hidden border border-gold/20 aspect-video bg-black shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                <iframe
                  width="100%" height="100%"
                  src={videoEmbedUrl}
                  title="Project Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Gallery */}
          {selectedProject.gallery && selectedProject.gallery.length > 0 && (
            <div>
              <h3 className="text-xs font-mono text-gold uppercase tracking-wider mb-3">Gallery ({selectedProject.gallery.length} images)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProject.gallery.map((media, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-video relative group/gal cursor-zoom-in shadow-md"
                    onClick={() => setActiveLuxuryImage({
                      url: media.url,
                      title: selectedProject.title,
                      subtitle: media.alt || `Gallery image ${idx + 1}`,
                    })}
                  >
                    <img
                      src={media.url}
                      alt={media.alt || 'Gallery image'}
                      className="w-full h-full object-cover group-hover/gal:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/gal:opacity-100 flex items-center justify-center text-gold font-mono text-xs font-bold transition-opacity">
                      🔍 View Big Size
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <LuxuryImageModal
          isOpen={Boolean(activeLuxuryImage)}
          onClose={() => setActiveLuxuryImage(null)}
          imageUrl={activeLuxuryImage?.url}
          title={activeLuxuryImage?.title}
          subtitle={activeLuxuryImage?.subtitle}
        />
      </div>
    )
  }

  // ── Project List View ──
  return (
    <div className="w-full h-full text-white p-6 flex flex-col overflow-y-auto bg-[#050014]/90">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display gradient-brand-text">Project Portfolio</h1>
          <p className="text-white/40 text-xs font-mono mt-1">Click any project to explore details & gallery</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all font-mono ${
                filter === cat
                  ? 'bg-gold/20 border-gold/60 text-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                  : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 pb-8"
      >
        {filteredProjects.map((project, idx) => (
          <motion.div
            key={project.slug || idx}
            variants={itemVariants}
            onClick={() => setSelectedProject(project)}
            className="group relative glassmorphism rounded-xl border border-white/10 overflow-hidden hover:border-gold/50 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)]"
          >
            {/* Project Image */}
            <div className="h-36 w-full bg-gradient-to-br from-black to-purple-900/40 relative overflow-hidden shrink-0">
              {project.coverImage?.url ? (
                <img
                  src={project.coverImage.url}
                  alt={project.coverImage.alt || project.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">🗂️</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {project.featured && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-[10px] font-mono uppercase">
                  Featured
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors leading-tight flex-1">{project.title}</h3>
                {project.status && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-gold/10 border border-gold/20 rounded text-gold/70 shrink-0">
                    {project.status}
                  </span>
                )}
              </div>

              <p className="text-sm text-white/60 line-clamp-2 mb-4 flex-1 leading-relaxed">
                {project.tagline}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-auto mb-3">
                {(project.techStack || []).slice(0, 4).map((t: string) => (
                  <span key={t} className="tag-tech">{t}</span>
                ))}
                {(project.techStack || []).length > 4 && (
                  <span className="tag-tech">+{(project.techStack || []).length - 4}</span>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gold/80">
                <span>
                  {project.gallery?.length ? `${project.gallery.length} gallery images` : 'View Details'}
                </span>
                <span className="group-hover:translate-x-1 transition-transform">Open →</span>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 flex items-center justify-center text-white/30 font-mono text-sm glassmorphism rounded-xl border border-white/5">
            No projects found for "{filter}".
          </div>
        )}
      </motion.div>
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
