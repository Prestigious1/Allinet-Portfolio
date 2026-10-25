'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { createOSApp } from '@/core/registry/AppRegistry'
import { services } from '@/core/providers'
import { BlogPostData } from '@/core/providers/portfolio/PortfolioProvider'
import { LuxuryImageModal } from '@/components/ui/LuxuryImageModal'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
}

function BlogAppComponent() {
  const [selectedPost, setSelectedPost] = useState<BlogPostData | null>(null)
  const [posts, setPosts] = useState<BlogPostData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLuxuryImage, setActiveLuxuryImage] = useState<{ url: string; title: string; subtitle: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    services.portfolio.getBlogPosts()
      .then(data => { if (isMounted) { setPosts(data); setLoading(false) } })
      .catch(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gold font-mono animate-pulse">Loading transmissions...</div>
  }

  // ── Post Detail ──
  if (selectedPost) {
    return (
      <div className="w-full h-full bg-[#050014]/90 text-white overflow-y-auto">
        {/* Cover Image Hero */}
        {selectedPost.coverImage?.url && (
          <div
            className="relative w-full h-48 overflow-hidden cursor-zoom-in group/hero"
            onClick={() => setActiveLuxuryImage({
              url: selectedPost.coverImage!.url,
              title: selectedPost.title,
              subtitle: `Published ${selectedPost.publishedAt ? new Date(selectedPost.publishedAt).toLocaleDateString() : ''}`,
            })}
          >
            <img
              src={selectedPost.coverImage.url}
              alt={selectedPost.title}
              className="w-full h-full object-cover group-hover/hero:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#050014]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity">
              <span className="bg-black/60 text-gold font-mono text-sm px-4 py-2 rounded-full border border-gold/40 backdrop-blur-sm">
                🔍 View Cover Image
              </span>
            </div>
          </div>
        )}

        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-white/50 hover:text-gold font-mono text-xs transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Blog
          </button>

          <div>
            {(selectedPost.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {(selectedPost.tags || []).map((tag: string) => (
                  <span key={tag} className="text-xs font-mono text-purple-300 bg-purple-900/30 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-3xl font-bold font-display gradient-brand-text leading-tight">{selectedPost.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-white/40 text-xs font-mono">
              {selectedPost.publishedAt && <span>📅 {new Date(selectedPost.publishedAt).toLocaleDateString()}</span>}
              {selectedPost.category && <span className="text-gold/80">· {selectedPost.category}</span>}
            </div>
          </div>

          {/* AI Summary */}
          {selectedPost.aiSummary && (
            <div className="glassmorphism p-4 rounded-xl border border-gold/20 bg-gold/5">
              <div className="flex items-center gap-2 text-gold text-xs font-mono uppercase tracking-wider mb-2">
                <span>🤖</span> AI Summary
              </div>
              <p className="text-sm text-white/80 leading-relaxed italic">{selectedPost.aiSummary}</p>
            </div>
          )}

          {/* Excerpt */}
          {selectedPost.excerpt && (
            <div className="glassmorphism p-5 rounded-xl border border-white/10">
              <p className="text-base text-white/80 leading-relaxed italic">{selectedPost.excerpt}</p>
            </div>
          )}

          {/* Content Placeholder */}
          <div className="min-h-32 bg-white/[0.02] border border-white/5 rounded-xl p-6 flex items-center justify-center text-white/30 font-mono text-sm">
            Full content rendered from Payload CMS Lexical editor
          </div>

          {/* Cover Image Button */}
          {selectedPost.coverImage?.url && (
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveLuxuryImage({
                  url: selectedPost.coverImage!.url,
                  title: selectedPost.title,
                  subtitle: 'Blog Cover Image',
                })}
                className="text-xs font-mono text-gold/90 hover:text-gold flex items-center gap-1.5"
              >
                <span>🖼️</span> View Cover Image Full Size
              </button>
              <button
                onClick={() => setSelectedPost(null)}
                className="btn-gold text-xs px-5 py-2"
              >
                ← Back
              </button>
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

  // ── Post List ──
  return (
    <div className="w-full h-full bg-[#050014]/90 text-white p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display gradient-brand-text">Engineering Blog</h1>
            <p className="text-white/40 text-xs font-mono mt-1">Thoughts on AI, WebGL & scalable systems · Click to read</p>
          </div>
          <span className="text-xs font-mono text-gold/80 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 hidden sm:inline-block">
            {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-white/30 font-mono text-sm glassmorphism rounded-xl border border-white/5">
            No posts published yet. Add entries in Payload CMS Admin.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {posts.map(post => (
              <motion.div
                key={post.slug}
                variants={itemVariants}
                onClick={() => setSelectedPost(post)}
                className="glassmorphism border border-white/10 hover:border-gold/40 rounded-xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)]"
              >
                {/* Cover Thumbnail */}
                {post.coverImage?.url && (
                  <div className="h-36 relative overflow-hidden">
                    <img
                      src={post.coverImage.url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(post.tags || []).slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-[10px] font-mono text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-500/20">
                        #{tag}
                      </span>
                    ))}
                    {post.featured && (
                      <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-bold text-white group-hover:text-gold transition-colors leading-tight mb-2">{post.title}</h2>
                  <p className="text-xs text-white/60 line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>

                  <div className="flex items-center justify-between text-xs font-mono text-white/30 border-t border-white/5 pt-3 mt-2">
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
                    <span className="text-gold/60 group-hover:translate-x-1 transition-transform">Read →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default createOSApp({
  id: 'blog',
  title: 'Blog',
  icon: 'book',
  canFullscreen: true,
  defaultWidth: 900,
  defaultHeight: 680,
}, BlogAppComponent)
