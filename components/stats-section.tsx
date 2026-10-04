'use client'

import { useRef } from 'react'
import { useInView } from 'motion/react'

import { AnimatedNumber } from '@/components/core/animated-number'

export function StatsSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const stats = [
    { value: 8, prefix: '', label: 'مدينة وصلنا إليها' },
    { value: 2000, prefix: '+', label: 'طلب مكتمل' },
  ]

  return (
    <section id="stats" ref={ref} className="relative overflow-hidden bg-[#06254a] px-5 py-14 text-white sm:px-6 sm:py-16">
      <div aria-hidden="true" className="absolute -start-16 -top-28 size-72 rounded-full bg-white/[0.05] blur-3xl" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="flex flex-col items-center">
          <p className="w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-bold text-white">
            أثر صحابي
          </p>
          <h2 className="mt-6 font-serif text-3xl leading-tight text-white sm:text-4xl">
            أرقام من القرّاء والمدن
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            نفخر بوصول صحابي إلى القرّاء في مدن مختلفة.
          </p>
        </div>

        <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-2 sm:gap-5">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-6 text-center shadow-inner shadow-white/[0.03] sm:py-7"
            >
              <p
                aria-label={`${stat.prefix}${stat.value}`}
                className="flex items-center justify-center text-4xl font-black tracking-tight text-white sm:text-5xl"
              >
                {stat.prefix}
                <AnimatedNumber
                  className="inline-flex items-center justify-center"
                  springOptions={{
                    bounce: 0,
                    duration: 2000,
                  }}
                  value={inView ? stat.value : 0}
                />
              </p>
              <p className="mt-2 text-sm text-white/65">{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
