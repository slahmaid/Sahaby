'use client'

import { cn } from '@/lib/utils'
import {
  motion,
  useSpring,
  useTransform,
  type SpringOptions,
} from 'motion/react'
import { useEffect } from 'react'

export function AnimatedNumber({
  value,
  className,
  springOptions,
}: {
  value: number
  className?: string
  springOptions?: SpringOptions
}) {
  const spring = useSpring(value, springOptions)
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString(),
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return (
    <motion.span className={cn('tabular-nums', className)}>{display}</motion.span>
  )
}
