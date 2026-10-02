'use client';

import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
  type RefObject,
} from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './accordion.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

export type AccordionItemApi = {
  toggle: () => void;
  isOpen: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  iconRef: RefObject<SVGSVGElement | null>;
  verticalBarRef: RefObject<SVGPathElement | null>;
};

type ItemProps = {
  children?: ReactNode | ((api: AccordionItemApi) => ReactNode);
  defaultOpen?: boolean;
  duration?: number;
  ease?: string;
  iconMode?: 'rotate' | 'fade' | 'both';
  iconRotation?: number;
  onOpen?: () => void;
  onClose?: () => void;
};

const AccordionItem = forwardRef(function AccordionItem(
  {
    children,
    defaultOpen = false,
    duration = 0.8,
    ease = 'expo.inOut',
    iconMode = 'both',
    iconRotation = -180,
    onOpen,
    onClose,
  }: ItemProps,
  ref,
) {
  const itemRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const verticalBarRef = useRef<SVGPathElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const toggleRef = useRef<() => void>(() => {});
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useImperativeHandle(
    ref,
    () => ({
      open: () => !isOpen && toggleRef.current(),
      close: () => isOpen && toggleRef.current(),
      toggle: () => toggleRef.current(),
      isOpen: () => isOpen,
    }),
    [isOpen],
  );

  const { contextSafe } = useGSAP({ scope: itemRef });

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!contentRef.current) return;

      gsap.set(contentRef.current, {
        height: 0,
        overflow: 'hidden',
        force3D: true,
        willChange: 'height',
      });

      tlRef.current = gsap.timeline({ paused: true, defaults: { duration, ease } });
      tlRef.current.to(contentRef.current, { height: 'auto', duration, ease }, 0);

      if (iconRef.current) {
        if (iconMode === 'rotate' || iconMode === 'both') {
          tlRef.current.to(iconRef.current, { rotation: iconRotation, duration, ease }, 0);
        }
        if ((iconMode === 'fade' || iconMode === 'both') && verticalBarRef.current) {
          tlRef.current.to(
            verticalBarRef.current,
            { opacity: 0, duration: duration * 0.5, ease: 'power2.inOut' },
            duration * 0.25,
          );
        }
      }

      if (defaultOpen) {
        tlRef.current.progress(1);
      }

      return () => {
        tlRef.current?.kill();
      };
    },
    { scope: itemRef, dependencies: [duration, ease, iconMode, iconRotation, defaultOpen] },
  );

  const toggle = contextSafe(() => {
    if (!tlRef.current) return;

    if (!isOpen) {
      tlRef.current.play();
      setIsOpen(true);
      onOpen?.();
    } else {
      tlRef.current.reverse();
      setIsOpen(false);
      onClose?.();
    }
  });

  toggleRef.current = toggle;

  return (
    <div ref={itemRef} className="accordion_item" data-anm-accordion-item>
      {typeof children === 'function'
        ? children({ toggle, isOpen, contentRef, iconRef, verticalBarRef })
        : children}
    </div>
  );
});

type AccordionProps = {
  className?: string;
  children?: ReactNode;
  allowMultiple?: boolean;
  duration?: number;
  ease?: string;
  iconMode?: 'rotate' | 'fade' | 'both';
  iconRotation?: number;
};

function Accordion({ className = '', children }: AccordionProps) {
  return (
    <div className={`accordion_section ${className}`.trim()} data-anm-accordion>
      {children}
    </div>
  );
}

Accordion.Item = AccordionItem;

export default Accordion;
