'use client'

import React, { useState } from 'react'

interface FileNode {
  name: string
  type: 'file' | 'folder'
  size?: string
  date: string
  content?: string
}

export default function FileExplorerApp() {
  const [currentPath, setCurrentPath] = useState<string[]>([])

  const fileSystem: Record<string, FileNode[]> = {
    'root': [
      { name: 'Documents', type: 'folder', date: '2026-07-17' },
      { name: 'Projects', type: 'folder', date: '2026-07-17' },
      { name: 'System32', type: 'folder', date: '2026-07-17' },
      { name: 'readme.txt', type: 'file', size: '2 KB', date: '2026-07-17', content: 'Welcome to ALLINET OS File System.' },
    ],
    'Documents': [
      { name: 'Resume.pdf', type: 'file', size: '150 KB', date: '2026-07-17' },
      { name: 'Vision.md', type: 'file', size: '12 KB', date: '2026-07-17' }
    ],
    'Projects': [
      { name: 'Agentic_AI', type: 'folder', date: '2026-07-17' }
    ],
    'System32': [
      { name: 'kernel.sys', type: 'file', size: '1024 KB', date: '2026-07-17' }
    ]
  }

  const currentFolder = currentPath.length === 0 ? 'root' : currentPath[currentPath.length - 1]
  const currentFiles = fileSystem[currentFolder] || []

  const handleNavigate = (folder: string) => {
    setCurrentPath([...currentPath, folder])
  }

  const handleGoUp = () => {
    setCurrentPath(currentPath.slice(0, -1))
  }

  return (
    <div className="w-full h-full flex flex-col text-slate-200 text-sm">
      {/* Toolbar */}
      <div className="flex items-center space-x-2 px-4 py-2 border-b border-white/10 bg-black/40">
        <button 
          onClick={handleGoUp}
          disabled={currentPath.length === 0}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-50"
        >
          ↑ Up
        </button>
        <div className="flex-1 bg-black/60 border border-white/10 rounded px-2 py-1 text-white/80 font-mono text-xs">
          C:\ALLINET\{currentPath.join('\\')}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-white/10 bg-black/20 p-2 hidden sm:block">
          <div className="font-bold text-xs text-white/50 mb-2 uppercase tracking-wider px-2">Quick Access</div>
          <button onClick={() => setCurrentPath([])} className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 flex items-center space-x-2">
            <span>💻</span><span>This PC</span>
          </button>
          <button onClick={() => setCurrentPath(['Documents'])} className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 flex items-center space-x-2">
            <span>📄</span><span>Documents</span>
          </button>
          <button onClick={() => setCurrentPath(['Projects'])} className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 flex items-center space-x-2">
            <span>📁</span><span>Projects</span>
          </button>
        </div>

        {/* File List */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentFiles.map((file, i) => (
              <div 
                key={i} 
                className="group flex flex-col items-center p-3 rounded-lg hover:bg-white/10 cursor-pointer border border-transparent hover:border-white/5 transition-colors text-center"
                onDoubleClick={() => file.type === 'folder' ? handleNavigate(file.name) : console.log('Open file', file.name)}
              >
                <div className="w-12 h-12 mb-2 flex items-center justify-center text-3xl">
                  {file.type === 'folder' ? '📁' : '📄'}
                </div>
                <span className="text-xs truncate w-full group-hover:text-white text-white/80">{file.name}</span>
                {file.type === 'file' && <span className="text-[10px] text-white/40">{file.size}</span>}
              </div>
            ))}
            {currentFiles.length === 0 && (
              <div className="col-span-full text-center text-white/40 mt-10">
                This folder is empty.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="px-4 py-1 text-xs text-white/40 border-t border-white/10 bg-black/40">
        {currentFiles.length} item(s)
      </div>
    </div>
  )
}
