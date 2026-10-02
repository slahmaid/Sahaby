'use client'

import { useRef } from 'react'
import { useInView } from 'motion/react'

import { AnimatedNumber } from '@/components/core/animated-number'

export function StatsSection({
  completedOrders = 0,
  citiesServed = 0,
}: {
  completedOrders?: number;
  citiesServed?: number;
}) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const stats = [
    { value: completedOrders, label: 'نسخة تم تسليمها' },
    { value: citiesServed, label: 'مدينة وصلنا إليها' },
    { value: completedOrders, label: 'طلب مكتمل' },
  ]

  return (
    <section id="stats" ref={ref} className="px-6 py-20 sm:py-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="flex flex-col items-center">
          <p className="w-fit rounded-full bg-[#06254a] px-3 py-1 text-sm font-bold text-white">
            صحابي
          </p>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-[#06254a] sm:text-5xl">
            أرقام من القرّاء والمدن
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#06254a]/70">
            أرقام الطلبات المكتملة والمدن التي وصلنا إليها، وتُحدّث تلقائيًا مع
            إدارة الطلبات.
          </p>
        </div>

        <div className="mt-12 grid w-full gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-[#06254a]/10 bg-white px-6 py-6 text-center"
            >
              <AnimatedNumber
                className="inline-flex items-center justify-center text-4xl font-black tracking-tight text-[#06254a] sm:text-5xl"
                springOptions={{
                  bounce: 0,
                  duration: 2000,
                }}
                value={inView ? stat.value : 0}
              />
              <p className="mt-2 text-sm text-[#06254a]/60">{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
