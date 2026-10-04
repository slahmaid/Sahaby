'use client'

import * as React from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { Check, Truck } from 'lucide-react'
import Balancer from 'react-wrap-balancer'

import { cn } from '@/lib/utils'

import { Cta, type CtaProps } from '@/components/ui/hero-10-utils/cta'

export interface Hero10Props {
  title: string
  titleLine2Prefix?: string
  titleHighlight?: string
  description: string
  socialProof?: string
  offerNote?: string
  images: string[]
  imageAlts?: string[]
  animation?: 'none' | 'subtle'
  primaryCTA: CtaProps
  secondaryCTA?: CtaProps
  variant?: 'standard' | 'compact'
}

const variantStyles = {
  standard: {
    section: 'py-20 sm:py-28',
    title: 'text-3xl sm:text-4xl md:text-5xl',
    description: 'max-w-lg text-sm sm:text-base',
    header: 'gap-5',
    content: 'gap-8 sm:gap-10',
    fan: 'max-w-3xl',
    fanCard: 'aspect-4/5',
  },
  compact: {
    section: 'py-14 sm:py-20',
    title: 'text-2xl sm:text-3xl md:text-4xl',
    description: 'max-w-md text-sm',
    header: 'gap-4',
    content: 'gap-6 sm:gap-8',
    fan: 'max-w-2xl',
    fanCard: 'aspect-4/5',
  },
} as const

const fanSlots = [
  { width: 'w-[38%]', layout: '-mr-8 z-10', rotate: -6, x: 48, ty: 24 },
  { width: 'w-[42%]', layout: 'z-20', rotate: 0, x: 0, ty: -8 },
  { width: 'w-[38%]', layout: '-ml-8 z-10', rotate: 6, x: -48, ty: 24 },
]

const easeOut = [0.22, 1, 0.36, 1] as const

const fanContainer: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.25,
      ease: easeOut,
      delay: 0.08,
      delayChildren: 0.1,
      staggerChildren: 0.04,
    },
  },
}

const fanCard: Variants = {
  hidden: (slot: (typeof fanSlots)[number]) => ({
    x: slot.x,
    rotate: slot.rotate,
    y: slot.ty,
  }),
  visible: (slot: (typeof fanSlots)[number]) => ({
    x: 0,
    rotate: slot.rotate,
    y: slot.ty,
    transition: { duration: 0.28, ease: easeOut },
  }),
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.25, ease: easeOut },
  },
}

function Reveal({
  active,
  variants,
  className,
  children,
}: Readonly<{
  active: boolean
  variants?: Variants
  className?: string
  children: React.ReactNode
}>) {
  if (!active) return <div className={className}>{children}</div>

  return (
    <motion.div variants={variants ?? item} className={className}>
      {children}
    </motion.div>
  )
}

function ImageFan({
  images,
  imageAlts,
  cardAspect,
  animate,
}: Readonly<{
  images: string[]
  imageAlts?: string[]
  cardAspect: string
  animate: boolean
}>) {
  return (
    <motion.div
      className="relative flex w-full items-center justify-center"
      variants={fanContainer}
      initial={animate ? 'hidden' : 'visible'}
      animate="visible"
    >
      {images.slice(0, 3).map((src, i) => {
        const slot = fanSlots[i] ?? fanSlots[1]
        return (
          <motion.div
            key={src}
            custom={slot}
            variants={fanCard}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-xl shadow-xl outline outline-black/10 dark:outline-white/10',
              cardAspect,
              slot.width,
              slot.layout,
            )}
          >
            <img
              src={src}
              alt={imageAlts?.[i] ?? ''}
              decoding="async"
              className="size-full object-cover"
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export function Hero10({
  title,
  titleLine2Prefix,
  titleHighlight,
  description,
  socialProof,
  offerNote,
  images,
  imageAlts,
  animation = 'none',
  primaryCTA,
  secondaryCTA,
  variant = 'standard',
}: Readonly<Hero10Props>) {
  const reduce = useReducedMotion()
  const animate = animation === 'subtle' && !reduce
  const vs = variantStyles[variant]

  const titleElement = title && (
    <h1
      className={cn(
        'text-foreground font-serif font-normal tracking-tight text-balance',
        vs.title,
      )}
    >
      <Balancer>{title}</Balancer>
      {(titleLine2Prefix || titleHighlight) && (
        <>
          <br />
          <Balancer>
            {titleLine2Prefix && <span>{titleLine2Prefix} </span>}
            {titleHighlight && (
              <span className="text-primary">{titleHighlight}</span>
            )}
          </Balancer>
        </>
      )}
    </h1>
  )

  const descriptionElement = description && (
    <p className={cn('text-muted-foreground', vs.description)}>
      <Balancer>{description}</Balancer>
    </p>
  )

  const ctasElement = (primaryCTA?.ctaEnabled || secondaryCTA?.ctaEnabled) && (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
      {primaryCTA?.ctaEnabled && <Cta cta={primaryCTA} />}
      {secondaryCTA?.ctaEnabled && (
        <Cta
          cta={{ ...secondaryCTA, variant: secondaryCTA.variant ?? 'outline' }}
        />
      )}
    </div>
  )

  const socialProofElement = socialProof && (
    <p className="text-muted-foreground text-xs font-medium">{socialProof}</p>
  )

  const offerElement = offerNote && (
    <p className="rounded-full border border-[#a71c32]/15 bg-white/80 px-4 py-2.5 text-sm font-bold text-foreground shadow-sm">
      <Truck aria-hidden="true" className="me-2 inline size-4 text-primary" />
      {offerNote}
    </p>
  )

  const mediaElement = images?.length ? (
    <ImageFan
      images={images}
      imageAlts={imageAlts}
      cardAspect={vs.fanCard}
      animate={animate}
    />
  ) : null

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#f7f4ed]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-[#a71c32]/[0.05] blur-3xl"
      />
      <motion.div
        className={cn(
          'relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2 md:gap-10 lg:px-12 lg:py-20',
        )}
        variants={animate ? container : undefined}
        initial={false}
        animate={animate ? 'visible' : undefined}
      >
        <Reveal
          active={animate}
          className={cn(
            'flex w-full flex-col items-center gap-5 text-center md:items-start md:text-start',
          )}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#06254a]/10 bg-white/80 px-3 py-1.5 text-xs font-bold text-[#06254a]/75 shadow-sm">
            <span className="size-2 rounded-full bg-[#a71c32]" />
            صحابي · قراءة أقرب إلى يومك
          </span>
          {titleElement}
          {descriptionElement}
          <div className="mt-1 flex w-full flex-col items-center gap-4 md:items-start">
            {ctasElement}
          </div>
          {offerElement}
          {socialProofElement ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-[#06254a]/65">
              <Check aria-hidden="true" className="size-4 text-emerald-700" />
              {socialProof}
            </p>
          ) : null}
        </Reveal>

        <div className="relative mx-auto w-full max-w-xl md:max-w-none">
          <div
            aria-hidden="true"
            className="absolute inset-8 rounded-[2rem] bg-[#06254a]/[0.06] blur-2xl"
          />
          <div className="relative rounded-[2rem] border border-white/80 bg-white/55 p-4 shadow-[0_24px_70px_rgba(6,37,74,0.12)] backdrop-blur-sm sm:p-6">
            {mediaElement}
            <div className="mx-auto mt-3 flex max-w-sm items-center justify-center gap-2 text-center text-xs font-semibold text-[#06254a]/60">
              <span className="size-1.5 rounded-full bg-[#a71c32]" />
              {titleHighlight || 'صحابي'} · مساحة هادئة لقراءة يومية
            </div>
          </div>
        </div>
      </motion.div>
      <div className="relative z-10 border-t border-[#06254a]/[0.07] bg-white/65">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-x-reverse divide-[#06254a]/10 px-3 py-4 text-center sm:px-8 sm:py-5">
          {['اختر المقاس المناسب', 'أرسل بيانات الطلب', 'نتواصل للتأكيد'].map(
            (step, index) => (
              <div
                className="flex items-center justify-center gap-2 px-1 text-[10px] font-bold text-[#06254a]/70 sm:gap-3 sm:text-sm"
                key={step}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#06254a] text-[10px] text-white sm:size-7 sm:text-xs">
                  {index + 1}
                </span>
                {step}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

export default Hero10
