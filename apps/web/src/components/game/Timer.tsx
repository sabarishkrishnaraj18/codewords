'use client'
import { motion } from 'framer-motion'

interface Props {
  seconds: number
  totalSeconds: number
  compact?: boolean
  variant?: 'circle' | 'bar' | 'digital'
  teamColor?: string
  team?: 'blue' | 'red'
}

export default function Timer({ seconds, totalSeconds, compact = false, variant = 'circle', teamColor, team }: Props) {
  const pct = Math.max(0, seconds / totalSeconds)
  const isUrgent = seconds <= 15
  const isLow = seconds <= 30

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const color = isUrgent ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e'

  // Digital pill variant — matches codenames.game timer box
  if (variant === 'digital') {
    const bgGradient = isUrgent
      ? 'linear-gradient(180deg, #ff8080 0%, #ff5555 100%)'
      : team === 'red'
      ? 'linear-gradient(180deg, #FFD19D 0%, #FFB374 100%)'
      : 'linear-gradient(180deg, #AEF4FF 0%, #9CF3FF 100%)'
    const textColor = isUrgent ? '#fff' : team === 'red' ? '#5a2010' : '#0d3050'
    return (
      <div
        className={`rounded-xl px-4 py-2 text-center select-none ${isUrgent ? 'timer-urgent' : ''}`}
        style={{ background: bgGradient, minWidth: 80 }}
      >
        <span className="font-black tabular-nums text-2xl leading-none" style={{ color: textColor }}>
          {timeStr}
        </span>
      </div>
    )
  }

  // Horizontal bar variant — used in spymaster section
  if (variant === 'bar') {
    const fillColor = isUrgent ? '#ef4444' : isLow ? '#f59e0b' : (teamColor ?? '#22c55e')
    return (
      <div className="relative w-full h-7 rounded-full overflow-hidden bg-black/40">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: fillColor, opacity: 0.45 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-mono font-bold text-sm ${isUrgent ? 'text-red-400' : 'text-white'}`}>
            {timeStr}
          </span>
        </div>
      </div>
    )
  }

  // Circle variant (default)
  const r = compact ? 14 : 20
  const size = compact ? 36 : 50
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference * (1 - pct)

  return (
    <div className={`flex items-center gap-1.5 ${compact ? '' : 'gap-2'}`}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={compact ? 3 : 4} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={compact ? 3 : 4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center font-bold ${compact ? 'text-[9px]' : 'text-xs'} ${isUrgent ? 'text-red-400 timer-urgent' : 'text-white'}`}>
          {secs < 10 && mins === 0 ? secs : timeStr.split(':')[1]}
        </span>
      </div>
      <span className={`font-mono font-bold ${compact ? 'text-sm' : 'text-lg'} ${isUrgent ? 'text-red-400 timer-urgent' : isLow ? 'text-yellow-400' : 'text-white'}`}>
        {timeStr}
      </span>
    </div>
  )
}
