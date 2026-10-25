'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { CertificateData } from '@/core/providers/portfolio/PortfolioProvider'
import { LuxuryImageModal } from '@/components/ui/LuxuryImageModal'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
}

function CertificatesAppComponent() {
  const [certificates, setCertificates] = useState<CertificateData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null)
  const [activeLuxuryImage, setActiveLuxuryImage] = useState<{ url: string; title: string; subtitle: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    services.portfolio
      .getCertificates()
      .then(data => {
        if (isMounted) {
          setCertificates(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gold font-mono animate-pulse">
        Fetching certificates...
      </div>
    )
  }

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6 space-y-6 bg-[#050014]/90 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display gradient-brand-text">Certifications & Badges</h1>
          <p className="text-white/50 text-xs font-mono mt-1">
            Verified professional certifications and technical credentials (Click card for full details & luxury image view)
          </p>
        </div>
        <span className="text-xs font-mono text-gold/80 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 hidden sm:inline-block">
          {certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'}
        </span>
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {certificates.map((cert, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            onClick={() => setSelectedCert(cert)}
            className="glassmorphism rounded-xl p-5 border border-white/10 hover:border-gold/40 hover:bg-white/[0.06] transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {cert.issuerLogo?.url ? (
                    <img
                      src={cert.issuerLogo.url}
                      alt={cert.issuer}
                      className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1 border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-lg shrink-0 text-gold group-hover:scale-105 transition-transform">
                      🏆
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight group-hover:text-gold transition-colors">{cert.name}</h3>
                    <p className="text-purple-light font-mono text-xs mt-0.5">{cert.issuer}</p>
                  </div>
                </div>
              </div>

              {/* Optional Scan Preview Thumbnail */}
              {cert.image?.url && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveLuxuryImage({
                      url: cert.image!.url,
                      title: cert.name,
                      subtitle: `Issued by ${cert.issuer}`,
                    })
                  }}
                  className="my-3 rounded-lg overflow-hidden border border-gold/30 bg-black/60 h-28 relative group/img cursor-zoom-in shadow-md"
                >
                  <img
                    src={cert.image.url}
                    alt={cert.name}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-gold font-mono text-xs font-bold gap-1">
                    <span>🔍 View Big Size Luxury</span>
                  </div>
                </div>
              )}

              <div className="space-y-1 font-mono text-xs text-white/50 my-2">
                <div>Issued: <span className="text-white/80">{cert.issueDate}</span></div>
                {cert.expiryDate && <div>Expires: <span className="text-white/80">{cert.expiryDate}</span></div>}
                {cert.credentialId && (
                  <div className="truncate">Credential ID: <span className="text-gold/90">{cert.credentialId}</span></div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gold/80">
              <span>View Credential & Details</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </motion.div>
        ))}

        {certificates.length === 0 && (
          <div className="col-span-full text-center py-12 text-white/40 font-mono text-sm glassmorphism rounded-xl border border-white/5">
            No certificates found. Add entries in Payload CMS Admin.
          </div>
        )}
      </motion.div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCert(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="glassmorphism border border-gold/30 rounded-2xl max-w-xl w-full max-h-[88vh] overflow-y-auto p-6 relative shadow-2xl text-white space-y-5"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center font-mono text-sm transition-all border border-white/10"
              >
                ✕
              </button>

              {/* High Resolution Luxury Certificate Image Frame */}
              {selectedCert.image?.url ? (
                <div
                  onClick={() =>
                    setActiveLuxuryImage({
                      url: selectedCert.image!.url,
                      title: selectedCert.name,
                      subtitle: `Issued by ${selectedCert.issuer}`,
                    })
                  }
                  className="rounded-2xl overflow-hidden border-2 border-gold/40 shadow-[0_0_35px_rgba(212,175,55,0.3)] bg-black/80 max-h-64 flex items-center justify-center relative cursor-zoom-in group/bigimg"
                >
                  <img
                    src={selectedCert.image.url}
                    alt={selectedCert.name}
                    className="w-full h-full object-contain max-h-64 group-hover/bigimg:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/bigimg:opacity-100 transition-opacity flex flex-col items-center justify-center text-gold font-mono text-sm font-bold gap-1">
                    <span>🔍 Click for Fullscreen Big Size Luxury View</span>
                  </div>
                </div>
              ) : null}

              {/* Header */}
              <div className="flex items-start gap-4 pr-8">
                {selectedCert.issuerLogo?.url ? (
                  <div
                    onClick={() =>
                      setActiveLuxuryImage({
                        url: selectedCert.issuerLogo!.url,
                        title: selectedCert.issuer,
                        subtitle: selectedCert.name,
                      })
                    }
                    className="cursor-pointer group/logo relative"
                  >
                    <img
                      src={selectedCert.issuerLogo.url}
                      alt={selectedCert.issuer}
                      className="w-14 h-14 rounded-xl object-contain bg-white/5 p-1.5 border border-gold/30 shrink-0 group-hover/logo:border-gold transition-all"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-2xl shrink-0 text-gold shadow-lg">
                    🏆
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white font-display leading-tight gradient-brand-text">{selectedCert.name}</h2>
                  <p className="text-gold font-mono text-sm mt-0.5">{selectedCert.issuer}</p>
                  <span className="text-xs font-mono text-purple-300 uppercase px-2.5 py-0.5 rounded-full bg-purple-900/40 border border-purple-500/30 inline-block mt-1">
                    {selectedCert.category}
                  </span>
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
                <div>
                  <span className="text-white/40 block">Issue Date</span>
                  <span className="text-white font-medium text-sm">{selectedCert.issueDate}</span>
                </div>
                {selectedCert.expiryDate && (
                  <div>
                    <span className="text-white/40 block">Expiration</span>
                    <span className="text-white font-medium text-sm">{selectedCert.expiryDate}</span>
                  </div>
                )}
                {selectedCert.credentialId && (
                  <div className="col-span-2">
                    <span className="text-white/40 block">Credential ID</span>
                    <span className="text-gold/90 select-all font-mono break-all text-sm">{selectedCert.credentialId}</span>
                  </div>
                )}
              </div>

              {/* Verification Button */}
              {selectedCert.credentialUrl ? (
                <a
                  href={selectedCert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-xs py-2.5 px-4 flex items-center justify-center gap-2 w-full text-center font-bold"
                >
                  <span>🔗</span> Verify Credential Online ↗
                </a>
              ) : (
                <div className="text-center text-xs text-white/40 font-mono py-2 bg-white/5 rounded-xl border border-white/5">
                  Verified Official Certification
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                {selectedCert.image?.url || selectedCert.issuerLogo?.url ? (
                  <button
                    onClick={() =>
                      setActiveLuxuryImage({
                        url: (selectedCert.image?.url || selectedCert.issuerLogo?.url)!,
                        title: selectedCert.name,
                        subtitle: `Issued by ${selectedCert.issuer}`,
                      })
                    }
                    className="text-xs font-mono text-gold/90 hover:text-gold flex items-center gap-1.5"
                  >
                    <span>🖼️</span> View Full Screen Luxury Image
                  </button>
                ) : <div />}
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Full-Screen Image Lightbox */}
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

export default createOSApp({
  id: 'certificates',
  title: 'Certificates',
  icon: 'award',
  canFullscreen: true,
  defaultWidth: 800,
  defaultHeight: 600,
}, CertificatesAppComponent)



