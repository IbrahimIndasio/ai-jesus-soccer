"use client";
import React, { Component } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { HumilityFooter, HUMILITY, CLOSING } from "./HumilityFooter";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { getConfidence } from "@/lib/utils";

export function isCompleteProphecy(text: string) {
  return [1, 2, 3, 4, 5, 6].every((n) =>
    new RegExp(`\\*\\*${n}\\.\\s`).test(text),
  );
}
function Reading({
  text,
  players = false,
}: {
  text: string;
  players?: boolean;
}) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        strong: ({ children }) => (
          <strong
            className={players ? "font-medium text-gold" : "font-semibold"}
          >
            {children}
          </strong>
        ),
        blockquote: ({ children }) => <blockquote>{children}</blockquote>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {text}
    </Markdown>
  );
}
export function ProphecyCard({
  markdown,
  streaming = false,
}: {
  markdown: string;
  streaming?: boolean;
}) {
  const reduced = useReducedMotion();
  const headers = Array.from(markdown.matchAll(/\*\*(\d)\.\s+([^*]+)\*\*/g));
  const intro = headers.length ? markdown.slice(0, headers[0].index) : markdown;
  const sections = headers.map((match, i) => ({
    number: Number(match[1]),
    title: match[2].trim(),
    text: markdown.slice(
      (match.index ?? 0) + match[0].length,
      headers[i + 1]?.index ?? markdown.length,
    ),
  }));
  const hasHumility = sections.some((s) => s.number === 7);
  return (
    <article data-testid="prophecy" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <span className="text-xs uppercase tracking-[.2em] text-gold">
          {streaming ? "The scroll is unfolding" : "The match scroll"}
        </span>
        <ConfidenceBadge confidence={getConfidence(markdown)} />
      </div>
      {intro.trim() && (
        <div className="scroll-copy font-display text-2xl">
          <Reading text={intro} />
        </div>
      )}
      {sections.map((section) =>
        section.number === 7 ? (
          <HumilityFooter key={section.number}>
            <Reading text={section.text} />
          </HumilityFooter>
        ) : (
          <motion.section
            key={section.number}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="rounded-xl border border-border bg-card p-6 sm:p-8"
          >
            <SectionHeader number={section.number} title={section.title} />
            <div className="scroll-copy text-base">
              <Reading text={section.text} players={section.number === 4} />
            </div>
          </motion.section>
        ),
      )}
      {!streaming && !hasHumility && (
        <HumilityFooter>
          <Reading text={HUMILITY + "\n\n" + CLOSING} />
        </HumilityFooter>
      )}
    </article>
  );
}
export class ProphecyErrorBoundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div role="alert" className="rounded-xl border border-border p-6">
        The scroll was torn. Try again.
      </div>
    ) : (
      this.props.children
    );
  }
}
