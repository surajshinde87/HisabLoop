"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation, m, type Variants } from "motion/react";

/**
 * Shared, minimal motion primitives for the public site. Only opacity and transform are animated
 * (GPU-friendly on mobile), every reveal runs once, and MotionConfig honours the user's
 * prefers-reduced-motion setting by dropping the movement and keeping a short fade.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const DISTANCE = 16;

type Tag = "div" | "section" | "header" | "ul" | "ol" | "dl" | "li" | "article" | "figure";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.45, ease: EASE }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

const reveal: Variants = {
  hidden: { opacity: 0, y: DISTANCE },
  visible: { opacity: 1, y: 0 },
};

/** Fades and slides content up when it scrolls into view, or on load with `immediate` (heroes). */
export function Reveal({
  as = "div",
  delay = 0,
  immediate = false,
  className,
  id,
  children,
}: {
  as?: Tag;
  delay?: number;
  immediate?: boolean;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  const Component = m[as];
  return (
    <Component
      id={id}
      className={className}
      variants={reveal}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true, margin: "0px 0px -10% 0px" } })}
      transition={{ duration: 0.45, ease: EASE, delay }}
    >
      {children}
    </Component>
  );
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

/** A list or grid whose StaggerItem children reveal one after another. */
export function Stagger({
  as = "div",
  className,
  children,
  ...rest
}: {
  as?: Tag;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const Component = m[as];
  return (
    <Component
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** A child of Stagger. `lift` adds a small hover rise for cards (ignored on touch). */
export function StaggerItem({
  as = "div",
  lift = false,
  className,
  children,
}: {
  as?: Tag;
  lift?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const Component = m[as];
  return (
    <Component
      className={className}
      variants={reveal}
      whileHover={lift ? { y: -3, transition: { duration: 0.2, ease: EASE } } : undefined}
    >
      {children}
    </Component>
  );
}
