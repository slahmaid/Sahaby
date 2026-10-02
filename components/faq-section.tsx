'use client'

import type { RefObject } from 'react'

import Accordion from '@/components/ui/accordion'
import {
  DEFAULT_STORE_SETTINGS,
  parseFaqContent,
} from '@/lib/storefront-types'

function PlusIcon({
  iconRef,
  verticalBarRef,
}: {
  iconRef: RefObject<SVGSVGElement | null>
  verticalBarRef: RefObject<SVGPathElement | null>
}) {
  return (
    <svg
      ref={iconRef}
      className="accordion_icon"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        ref={verticalBarRef}
        d="M8 1V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M1 8H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FaqSection({
  items = parseFaqContent(DEFAULT_STORE_SETTINGS.faqContent),
}: {
  items?: { question: string; answer: string }[];
}) {
  return (
    <section id="faq" className="px-6 py-20 sm:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <h2 className="text-center font-serif text-4xl text-[#06254a] sm:text-5xl">
          أسئلة شائعة
        </h2>
        <p className="mt-4 mb-10 text-center text-base text-[#06254a]/70">
          إجابات مختصرة عن المقاس والتوصيل وتأكيد الطلب.
        </p>
        <Accordion className="w-full">
          {items.map((item, index) => (
            <Accordion.Item key={item.question} defaultOpen={index === 0}>
              {({ toggle, isOpen, contentRef, iconRef, verticalBarRef }) => (
                <>
                  <button
                    type="button"
                    className="accordion_trigger"
                    aria-expanded={isOpen}
                    onClick={toggle}
                  >
                    <span className="accordion_title">{item.question}</span>
                    <PlusIcon iconRef={iconRef} verticalBarRef={verticalBarRef} />
                  </button>
                  <div ref={contentRef} className="accordion_content">
                    <p className="accordion_text">{item.answer}</p>
                  </div>
                </>
              )}
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
