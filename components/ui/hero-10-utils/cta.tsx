import { cva } from 'class-variance-authority'

import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'

export interface CtaProps {
  ctaEnabled?: boolean
  text: string
  link: string
  variant?: ButtonVariant
  size?: 'default' | 'sm' | 'lg'
}

const ctaVariants = cva('w-fit rounded-full px-4', {
  variants: {
    invert: {
      true: 'bg-white! text-zinc-900! border-transparent! hover:bg-zinc-100!',
      false: '',
    },
  },
  defaultVariants: {
    invert: false,
  },
})

function isExternal(link: string) {
  return /^https?:\/\//i.test(link)
}

export function Cta({
  cta,
  className,
  invert,
}: Readonly<{ cta?: CtaProps; className?: string; invert?: boolean }>) {
  if (!cta?.ctaEnabled) {
    return null
  }

  const variant = cta.variant ?? (invert ? 'secondary' : 'default')

  if (!cta.link) {
    return (
      <Button
        className={cn(ctaVariants({ invert }), className)}
        variant={variant}
        size={cta.size ?? 'default'}
        aria-label={cta.text}
        type="button"
      >
        {cta.text}
      </Button>
    )
  }

  const external = isExternal(cta.link)

  return (
    <a
      href={cta.link}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={cta.text}
      className={cn(
        buttonVariants({
          variant,
          size: cta.size ?? 'default',
          className: cn(ctaVariants({ invert }), className),
        }),
      )}
    >
      {cta.text}
      {external ? (
        <span className="sr-only">{`${cta.text} (opens in new tab)`}</span>
      ) : null}
    </a>
  )
}
