'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react'

interface InteractiveImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  enableZoom?: boolean
  enableFullscreen?: boolean
  hoverEffect?: boolean
}

export default function InteractiveImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  enableZoom = true,
  enableFullscreen = true,
  hoverEffect = true,
}: InteractiveImageProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !hoverEffect) return
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  const toggleZoom = () => {
    if (enableZoom) {
      setIsZoomed(!isZoomed)
    }
  }

  const toggleFullscreen = () => {
    if (enableFullscreen) {
      setIsFullscreen(!isFullscreen)
    }
  }

  return (
    <>
      <motion.div
        className={`relative group cursor-zoom-in ${className}`}
        onMouseMove={handleMouseMove}
        onClick={toggleZoom}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={hoverEffect ? { scale: 1.02 } : {}}
      >
        <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50 backdrop-blur">
          <motion.div
            className="relative"
            animate={
              isZoomed
                ? {
                    scale: 1.5,
                    x: mousePosition.x > 50 ? -50 : 50,
                    y: mousePosition.y > 50 ? -50 : 50,
                  }
                : { scale: 1, x: 0, y: 0 }
            }
            transition={{ duration: 0.3 }}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              className={`w-full h-auto object-contain transition-transform duration-300 ${
                isZoomed ? 'cursor-zoom-out' : ''
              }`}
              quality={90}
            />
          </motion.div>

          {/* Overlay with controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4 gap-2">
            {enableZoom && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleZoom()
                }}
                className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
              >
                {isZoomed ? (
                  <ZoomOut className="w-5 h-5 text-white" />
                ) : (
                  <ZoomIn className="w-5 h-5 text-white" />
                )}
              </motion.button>
            )}

            {enableFullscreen && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFullscreen()
                }}
                className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="View fullscreen"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </div>

          {/* Zoom indicator */}
          {isZoomed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm rounded-lg text-sm text-white"
            >
              Click to zoom out • Scroll to pan
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={toggleFullscreen}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-7xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              quality={100}
            />
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-3 bg-slate-900/90 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors text-white"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

