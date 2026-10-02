'use client'

import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'motion/react'
import { buttonVariants } from './button'

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M14.5 8.5V6.8c0-.7.5-1 1.1-1H17V3h-2.2C12.2 3 11 4.4 11 6.6v1.9H9v2.7h2V21h3.5v-9.8h2.3l.4-2.7h-2.7z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C18.3 5.4 12 5.4 12 5.4s-6.3 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 9 2 12.2 2 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.5.4 7.8.4 7.8.4s6.3 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM10 15.5v-6.6l5.2 3.3-5.2 3.3z" />
    </svg>
  )
}

const socialLinks = [
  { title: 'فيسبوك', href: '#', icon: FacebookIcon },
  { title: 'إنستغرام', href: '#', icon: InstagramIcon },
  { title: 'يوتيوب', href: '#', icon: YoutubeIcon },
]

function AnimatedContainer({
  delay = 0.1,
  children,
  className,
}: {
  delay?: number
  children?: React.ReactNode
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StickyFooter({
  className,
  ...props
}: React.ComponentProps<'footer'>) {
  return (
    <footer
      className={cn('relative h-[340px] w-full', className)}
      style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
      {...props}
    >
      <div className="fixed bottom-0 z-0 h-[340px] w-full">
        <div className="sticky top-[calc(100vh-340px)] h-full overflow-y-auto">
          <div className="relative flex size-full flex-col justify-between gap-5 border-t border-[#06254a]/10 bg-white px-4 pt-8 pb-8 md:px-12">
            <div
              aria-hidden
              className="absolute inset-0 isolate z-0 contain-strict"
            >
              <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full" />
              <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full" />
              <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 rounded-full" />
            </div>
            <div className="relative z-10 mt-6 flex justify-center">
              <AnimatedContainer className="flex max-w-sm flex-col items-center space-y-4 text-center">
                <img src="/Logo.svg" alt="شعار صحابي" className="h-12 w-auto" />
                <p className="text-muted-foreground text-sm">
                  مصحف للقراءة الهادئة. اختر المقاس، وأرسل طلبك، ويصلك مجانًا إلى
                  مدينتك.
                </p>
                <div className="flex gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.title}
                      href={link.href}
                      aria-label={link.title}
                      className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
                    >
                      <link.icon className="size-4" />
                    </a>
                  ))}
                </div>
              </AnimatedContainer>
            </div>
            <div className="text-muted-foreground relative z-10 flex flex-col items-center justify-between gap-2 border-t border-[#06254a]/10 pt-4 text-sm md:flex-row">
              <p>© 2026 صحابي. جميع الحقوق محفوظة.</p>
              <p>SAHABY</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
