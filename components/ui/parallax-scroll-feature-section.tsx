'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

import { cn } from '@/lib/utils'

const sections = [
  {
    id: 1,
    title: 'خط واضح',
    description:
      'حروف كبيرة ومريحة، تُقرأ دون إجهاد، في البيت وفي الطريق.',
    imageUrl:
      'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&h=900&q=80',
    imageAlt: 'مصحف مفتوح',
    reverse: false,
  },
  {
    id: 2,
    title: 'مقاس يناسب اليد',
    description:
      'متوسط للحمل، وكبير لجلسة القراءة. اختر ما يلزمك قبل الطلب.',
    imageUrl:
      'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=900&h=900&q=80',
    imageAlt: 'خط قرآني',
    reverse: true,
  },
  {
    id: 3,
    title: 'تفاصيل التوصيل',
    description: '',
    imageUrl:
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=900&h=900&q=80',
    imageAlt: 'مسجد',
    reverse: false,
  },
] as const

export function ParallaxScrollFeatureSection({
  deliveryDetails,
}: {
  deliveryDetails: string;
}) {
  const ref0 = useRef<HTMLDivElement>(null)
  const ref1 = useRef<HTMLDivElement>(null)
  const ref2 = useRef<HTMLDivElement>(null)
  const refs = [ref0, ref1, ref2]

  const { scrollYProgress: progress0 } = useScroll({
    target: ref0,
    offset: ['start end', 'center start'],
  })
  const { scrollYProgress: progress1 } = useScroll({
    target: ref1,
    offset: ['start end', 'center start'],
  })
  const { scrollYProgress: progress2 } = useScroll({
    target: ref2,
    offset: ['start end', 'center start'],
  })

  const opacity0 = useTransform(progress0, [0, 0.7], [0, 1])
  const opacity1 = useTransform(progress1, [0, 0.7], [0, 1])
  const opacity2 = useTransform(progress2, [0, 0.7], [0, 1])
  const clip0 = useTransform(progress0, [0, 0.7], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'])
  const clip1 = useTransform(progress1, [0, 0.7], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'])
  const clip2 = useTransform(progress2, [0, 0.7], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'])
  const shift0 = useTransform(progress0, [0, 1], [-50, 0])
  const shift1 = useTransform(progress1, [0, 1], [-50, 0])
  const shift2 = useTransform(progress2, [0, 1], [-50, 0])

  const motions = [
    { opacity: opacity0, clip: clip0, shift: shift0 },
    { opacity: opacity1, clip: clip1, shift: shift1 },
    { opacity: opacity2, clip: clip2, shift: shift2 },
  ]

  return (
    <section id="about" className="w-full">
      <div className="mx-auto flex max-w-6xl flex-col px-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={refs[index]}
            className={cn(
              'flex min-h-[80vh] flex-col items-center justify-center gap-10 py-16 md:h-screen md:flex-row md:gap-24',
              section.reverse && 'md:flex-row-reverse',
            )}
          >
            <motion.div style={{ y: motions[index].shift }} className="max-w-sm text-center md:text-start">
              <h2 className="font-serif text-4xl text-[#06254a] sm:text-5xl md:text-6xl">
                {section.title}
              </h2>
              <p className="mt-6 text-base text-[#06254a]/70">
                {index === 2 ? deliveryDetails : section.description}
              </p>
            </motion.div>
            <motion.div
              style={{
                opacity: motions[index].opacity,
                clipPath: motions[index].clip,
              }}
              className="relative"
            >
              <img
                src={section.imageUrl}
                alt={section.imageAlt}
                className="size-64 object-cover sm:size-80"
              />
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}
