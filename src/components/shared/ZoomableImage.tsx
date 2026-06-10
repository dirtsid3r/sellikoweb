'use client'

import { useState, useRef, MouseEvent } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ZoomableImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  onError?: (e: any) => void
}

export default function ZoomableImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  onError
}: ZoomableImageProps) {
  const [zoomOrigin, setZoomOrigin] = useState("center center")
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Desktop hover zoom handler
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    // Calculate cursor coordinates relative to container width and height as percentages
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    
    setZoomOrigin(`${x}% ${y}%`)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setZoomOrigin("center center")
  }

  // Mobile/desktop click to open full-screen overlay
  const handleImageClick = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`relative overflow-hidden select-none group h-full w-full ${containerClassName}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleImageClick}
      >
        <img
          src={src}
          alt={alt}
          onError={onError}
          style={{
            transformOrigin: zoomOrigin,
            transform: isHovered ? 'scale(2.2)' : 'scale(1)',
          }}
          className={`w-full h-full object-cover transition-transform duration-150 ease-out cursor-zoom-in ${className}`}
        />
        
        {/* Subtle dynamic overlay label to guide user */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white/90 text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none uppercase tracking-wider font-semibold">
          Click to Zoom
        </div>
      </div>

      {/* Premium Full-Screen Zoom Overlay Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95 backdrop-blur-lg border-none shadow-2xl flex flex-col items-center justify-center rounded-2xl select-none">
          <DialogTitle className="sr-only">Zoomed View: {alt}</DialogTitle>
          
          {/* Custom close button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all hover:scale-105 active:scale-95 duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Interactive Zoomed Image Viewport */}
          <div className="relative w-full h-[85vh] flex items-center justify-center p-4">
            <img
              src={src}
              alt={alt}
              onError={onError}
              className="max-w-full max-h-full object-contain rounded-lg animate-in fade-in zoom-in-95 duration-300 ease-out"
            />
          </div>
          
          {/* Bottom Caption Overlay */}
          <div className="w-full py-4 px-6 bg-gradient-to-t from-black/80 to-transparent text-center">
            <p className="text-white/80 text-sm font-medium tracking-wide">
              {alt}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
