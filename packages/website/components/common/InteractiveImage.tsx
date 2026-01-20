'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Maximize2, X } from 'lucide-react'

interface InteractiveImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  enableFullscreen?: boolean
}

export default function InteractiveImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  enableFullscreen = true,
}: InteractiveImageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const toggleFullscreen = () => {
    if (enableFullscreen) {
      setIsFullscreen(!isFullscreen)
      // Prevent body scroll when fullscreen is open
      if (!isFullscreen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
    }
  }

  return (
    <>
      <div
        className={`relative group ${className}`}
      >
        <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative">
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              quality={85}
              className={`w-full h-auto object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-slate-800/50 animate-pulse" />
            )}
          </div>

          {/* Subtle overlay with fullscreen control */}
          {enableFullscreen && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
              <button
                onClick={toggleFullscreen}
                className="p-2.5 bg-slate-900/90 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
                aria-label="View fullscreen"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen modal - optimized */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center p-4"
          onClick={toggleFullscreen}
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image viewer"
        >
          <div
            className="relative max-w-7xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              quality={90}
              sizes="100vw"
            />
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-3 bg-slate-900/95 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors text-white shadow-lg"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
