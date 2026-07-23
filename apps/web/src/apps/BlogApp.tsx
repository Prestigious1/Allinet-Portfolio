'use client'

import React, { useState, useEffect } from 'react'
import { createOSApp } from '@/core/registry/AppRegistry'
import { services } from '@/core/providers'
import { BlogPostData } from '@/core/providers/portfolio/PortfolioProvider'

function BlogAppComponent() {
  const [selectedPost, setSelectedPost] = useState<BlogPostData | null>(null)
  const [posts, setPosts] = useState<BlogPostData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    services.portfolio.getBlogPosts().then(data => {
      setPosts(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])


  if (loading) {
    return <div className="p-8 text-white">Loading transmission...</div>
  }

  if (selectedPost) {
    return (
      <div className="w-full h-full bg-[#050014] text-white p-8 overflow-y-auto">
        <button 
          onClick={() => setSelectedPost(null)}
          className="text-purple-400 hover:text-white mb-6 flex items-center transition-colors"
        >
          <span className="mr-2">←</span> Back to posts
        </button>
        <h1 className="text-4xl font-bold mb-4">{selectedPost.title}</h1>
        <div className="flex gap-4 text-gray-400 text-sm mb-8 border-b border-white/10 pb-4">
          <span>{selectedPost.publishedAt ? new Date(selectedPost.publishedAt).toLocaleDateString() : 'Unknown Date'}</span>
          <div className="flex gap-2">
            {(selectedPost.tags || []).map((tag: string) => (
              <span key={tag} className="text-gold">#{tag}</span>
            ))}
          </div>
        </div>
        <div className="prose prose-invert prose-purple max-w-none">
          <p className="text-xl text-gray-300 leading-relaxed mb-6">
            {selectedPost.excerpt}
          </p>
          <div className="h-64 w-full bg-purple-900/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-6 text-purple-400/50">
            [Content will be rendered from CMS via Payload & Lexical]
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#050014] text-white p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2">Engineering Blog</h1>
          <p className="text-gray-400">Thoughts on AI, WebGL, and scalable systems.</p>
        </header>

        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">No posts available yet. Check back later.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map(post => (
              <div 
                key={post.slug}
                onClick={() => setSelectedPost(post)}
                className="bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-xl p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 group"
              >
                <div className="flex gap-2 mb-3">
                  {(post.tags || []).map((tag: string) => (
                    <span key={tag} className="text-xs font-mono text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-bold mb-3 group-hover:text-gold transition-colors">{post.title}</h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            ))}
          </div>
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
  defaultHeight: 700
}, BlogAppComponent)
