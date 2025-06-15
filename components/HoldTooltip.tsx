import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'

export type TooltipPosition = 'bottom' | 'right' | 'top' | 'left'

interface HoldTooltipProps {
  children: ReactNode
  tooltip: string
  shortcut?: string | string[]
  position?: TooltipPosition
  holdDuration?: number
  className?: string
  theme?: string
}

export default function HoldTooltip({
  children,
  tooltip,
  shortcut,
  position = 'bottom',
  holdDuration = 100,
  className,
  theme,
}: HoldTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 })

  const start = () => {
    timerRef.current = setTimeout(() => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect()
        let top = 0
        let left = 0

        switch (position) {
          case 'bottom':
            top = rect.bottom + window.scrollY + 8
            left = rect.left + window.scrollX + rect.width / 2
            break
          case 'top':
            top = rect.top + window.scrollY - 8
            left = rect.left + window.scrollX + rect.width / 2
            break
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2
            left = rect.right + window.scrollX + 8
            break
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2
            left = rect.left + window.scrollX - 8
            break
        }

        setTooltipCoords({ top, left })
        setShowTooltip(true)
      }
    }, holdDuration)
  }
  
  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setShowTooltip(false)
  }

  useEffect(() => () => clear(), [])
  
  const renderPortal = () => {
    if (typeof window === 'undefined' || !showTooltip) return null
    
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          top: tooltipCoords.top,
          left: tooltipCoords.left,
          transform: position === 'bottom' 
            ? 'translateX(-50%)' 
            : position === 'top' 
              ? 'translateX(-50%) translateY(-100%)' 
              : position === 'right' 
                ? 'translateY(-50%)' 
                : 'translateX(-100%) translateY(-50%)',
          zIndex: 9999,
        }}
        className={`${theme === 'dark' ? 'bg-black' : 'bg-white'} rounded px-3 py-2 text-[11px] shadow-lg pointer-events-none whitespace-nowrap`}
      >
        {tooltip && <div className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>{tooltip}</div>}
        {shortcut && (
          <div className={cn("text-[10px] text-white rounded flex gap-1", tooltip ? "mt-1" : "")}>
            {Array.isArray(shortcut) ? 
              shortcut.map((item, index) => (
                <span key={index} className={`${theme === 'dark' ? 'bg-[#26202f] text-[#fef]' : 'bg-[#fef] text-[#ba4077]'} rounded px-1 py-1`}>{item}</span>
              )) : 
              <></>
            }
          </div>
        )}
      </motion.div>,
      document.body
    )
  }

  return (
    <div
      ref={targetRef}
      className={cn('inline-flex', className)}
      onMouseDown={start}
      onMouseEnter={start}
      onMouseUp={clear}
      onMouseLeave={clear}
      onTouchStart={start}
      onTouchEnd={clear}
      onTouchCancel={clear}
    >
      {children}
      {renderPortal()}
    </div>
  )
}
