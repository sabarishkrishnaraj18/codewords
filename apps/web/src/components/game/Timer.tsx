'use client'
import { motion } from 'framer-motion'

interface Props {
  seconds: number
  totalSeconds: number
  compact?: boolean
}

export default function Timer({ seconds, totalSeconds, compact = false }: Props) {
  const pct = Math.max(0, seconds / totalSeconds)
  const isUrgent = seconds <= 15
  const isLow = seconds <= 30

  const r = compact ? 14 : 20
  const size = compact ? 36 : 50
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference * (1 - pct)

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const color = isUrgent ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e'

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
