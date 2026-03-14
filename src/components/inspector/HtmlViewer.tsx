"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { Loader2, FileWarning, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Issue } from "@/lib/types";

const textFetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to load HTML");
    return r.text();
  });

// Lightweight HTML syntax tokenizer
interface Token {
  type: "tag" | "attr" | "value" | "text" | "comment" | "punct";
  text: string;
}

function tokenizeHtml(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Comment
    if (line.startsWith("<!--", i)) {
      const end = line.indexOf("-->", i);
      const commentEnd = end === -1 ? line.length : end + 3;
      tokens.push({ type: "comment", text: line.slice(i, commentEnd) });
      i = commentEnd;
      continue;
    }

    // Closing tag or opening tag
    if (line[i] === "<") {
      // Find end of tag
      const tagEnd = line.indexOf(">", i);
      if (tagEnd === -1) {
        tokens.push({ type: "text", text: line.slice(i) });
        break;
      }

      const tagContent = line.slice(i, tagEnd + 1);
      // Tokenize within the tag
      tokens.push(...tokenizeTag(tagContent));
      i = tagEnd + 1;
      continue;
    }

    // Text content
    const nextTag = line.indexOf("<", i);
    const textEnd = nextTag === -1 ? line.length : nextTag;
    if (textEnd > i) {
      tokens.push({ type: "text", text: line.slice(i, textEnd) });
    }
    i = textEnd;
  }

  return tokens;
}

function tokenizeTag(tag: string): Token[] {
  const tokens: Token[] = [];

  // Match: < or </ + tagname
  const openMatch = tag.match(/^(<\/?)([\w-]+)/);
  if (!openMatch) {
    tokens.push({ type: "punct", text: tag });
    return tokens;
  }

  tokens.push({ type: "punct", text: openMatch[1] });
  tokens.push({ type: "tag", text: openMatch[2] });

  const rest = tag.slice(openMatch[0].length);

  // Match attributes
  const attrRegex = /(\s+)([\w-]+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]*))?/g;
  let match;
  let lastIndex = 0;

  while ((match = attrRegex.exec(rest)) !== null) {
    // Whitespace before attr
    if (match[1]) {
      tokens.push({ type: "text", text: match[1] });
    }
    // Attr name
    tokens.push({ type: "attr", text: match[2] });
    // = sign
    if (match[3]) {
      tokens.push({ type: "punct", text: match[3] });
    }
    // Attr value
    if (match[4]) {
      tokens.push({ type: "value", text: match[4] });
    }
    lastIndex = match.index + match[0].length;
  }

  // Remaining (like > or />)
  const tail = rest.slice(lastIndex);
  if (tail) {
    tokens.push({ type: "punct", text: tail });
  }

  return tokens;
}

const tokenColors: Record<Token["type"], string> = {
  tag: "text-[#61afef]",
  attr: "text-[#c678dd]",
  value: "text-[#98c379]",
  text: "text-[#abb2bf]",
  comment: "text-[#5c6370] italic",
  punct: "text-[#abb2bf]/60",
};

/** Find the line index of the issue's element in the formatted HTML using multiple strategies. */
function findElementLine(
  html: string | undefined,
  lines: string[],
  selector: string,
  elementHtml: string
): number {
  if (!html || lines.length === 0) return -1;

  // Strategy 1: ID selector → search for id="value"
  if (selector) {
    const idMatch = selector.match(/^#([\w-]+)/);
    if (idMatch) {
      const needle = `id="${idMatch[1]}"`;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(needle)) return i;
      }
    }

    // Class selectors → search for all class names on one line
    const classMatches = selector.match(/\.([\w-]+)/g);
    if (classMatches && classMatches.length > 0) {
      const classNames = classMatches.map((c) => c.slice(1));
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('class="') && classNames.every((cn) => line.includes(cn))) {
          return i;
        }
      }
    }
  }

  // Strategy 2: Match on key attributes from elementHtml
  if (elementHtml) {
    const openTagMatch = elementHtml.match(/^<(\w+)([^>]*?)>/);
    if (openTagMatch) {
      const tagName = openTagMatch[1].toLowerCase();
      const attrsStr = openTagMatch[2];

      // Extract key attributes to search for
      const attrPatterns: string[] = [];
      const attrRegex = /(href|src|alt|title|name|role|aria-label|data-[\w-]+)="([^"]{3,60})"/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
        attrPatterns.push(attrMatch[2]);
      }

      if (attrPatterns.length > 0) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes('<' + tagName) && attrPatterns.every((p) => line.includes(p))) {
            return i;
          }
        }
      }

      // Fallback: match tag with first distinguishing attribute
      const firstAttr = attrsStr.trim().slice(0, 80);
      if (firstAttr) {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('<' + tagName) && lines[i].includes(firstAttr.split('"')[0])) {
            return i;
          }
        }
      }
    }
  }

  // Strategy 3: Direct substring match (last resort)
  if (elementHtml) {
    const needle = elementHtml.slice(0, 80);
    const index = html.indexOf(needle);
    if (index !== -1) {
      const before = html.slice(0, index);
      return before.split("\n").length - 1;
    }
  }

  return -1;
}

/** Given a matched opening tag line, estimate how many lines the element spans. */
function findClosingLine(lines: string[], startLine: number): number {
  const line = lines[startLine];
  // Check if it's a self-closing or single-line element
  if (line.trimEnd().endsWith("/>") || /^.*<\/\w+>\s*$/.test(line)) return 1;

  // Extract the tag name to find the closing tag
  const tagMatch = line.match(/<(\w+)/);
  if (!tagMatch) return 1;
  const tagName = tagMatch[1].toLowerCase();

  // Look ahead for the closing tag (max 20 lines)
  let depth = 1;
  for (let i = startLine + 1; i < Math.min(startLine + 20, lines.length); i++) {
    const l = lines[i];
    // Count opening tags of the same type
    const opens = (l.match(new RegExp(`<${tagName}[\\s>]`, "g")) ?? []).length;
    const closes = (l.match(new RegExp(`</${tagName}>`, "g")) ?? []).length;
    depth += opens - closes;
    if (depth <= 0) return i - startLine + 1;
  }
  // Default: highlight a few lines
  return Math.min(3, lines.length - startLine);
}

// Lines to show around the highlighted line
const CONTEXT_LINES = 100;
const EXPAND_CHUNK = 100;

interface HtmlViewerProps {
  scanId: string;
  issue: Issue;
}

export function HtmlViewer({ scanId, issue }: HtmlViewerProps) {
  const highlightRef = useRef<HTMLDivElement>(null);
  const { data: html, error, isLoading } = useSWR(
    `/api/scans/${scanId}/html`,
    textFetcher,
    { revalidateOnFocus: false }
  );

  const lines = useMemo(() => (html ? html.split("\n") : []), [html]);

  // Find the line containing the issue's element
  const matchLineIndex = useMemo(
    () => findElementLine(html, lines, issue.elementSelector, issue.elementHtml),
    [html, lines, issue.elementSelector, issue.elementHtml]
  );

  const matchLineCount = useMemo(
    () => matchLineIndex >= 0 ? findClosingLine(lines, matchLineIndex) : 1,
    [lines, matchLineIndex]
  );

  // Windowed rendering: show lines around the match
  const defaultRange = useMemo(() => {
    if (lines.length === 0) return { start: 0, end: 0 };

    if (matchLineIndex >= 0) {
      const start = Math.max(0, matchLineIndex - CONTEXT_LINES);
      const end = Math.min(
        lines.length,
        matchLineIndex + matchLineCount + CONTEXT_LINES
      );
      return { start, end };
    }
    // No match — show first 300 lines
    return { start: 0, end: Math.min(lines.length, 300) };
  }, [lines, matchLineIndex, matchLineCount]);

  const [extraUp, setExtraUp] = useState(0);
  const [extraDown, setExtraDown] = useState(0);
  const [resetKey, setResetKey] = useState(matchLineIndex);

  // Reset expansions when issue changes
  if (resetKey !== matchLineIndex) {
    setResetKey(matchLineIndex);
    setExtraUp(0);
    setExtraDown(0);
  }

  const rangeStart = Math.max(0, defaultRange.start - extraUp);
  const rangeEnd = Math.min(lines.length, defaultRange.end + extraDown);

  // Auto-scroll to highlighted line
  useEffect(() => {
    if (highlightRef.current) {
      const timeout = setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [matchLineIndex, rangeStart]);

  const handleExpandUp = () => {
    setExtraUp((v) => v + EXPAND_CHUNK);
  };

  const handleExpandDown = () => {
    setExtraDown((v) => v + EXPAND_CHUNK);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-5 animate-spin text-white/30" />
          <p className="text-xs text-white/40">Loading page HTML...</p>
        </div>
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-3">
          <FileWarning className="size-5 text-white/30" />
          <p className="text-xs text-white/40">HTML source not available</p>
        </div>
      </div>
    );
  }

  const gutterWidth = String(lines.length).length;
  const visibleLines = lines.slice(rangeStart, rangeEnd);

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      {/* Info bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#1e1e1e] px-3 py-1.5">
        <span className="font-mono text-[10px] text-white/30">
          {lines.length} lines
          {matchLineIndex >= 0 && (
            <> &middot; Issue at line {matchLineIndex + 1}</>
          )}
        </span>
        <span className="font-mono text-[10px] text-white/30">
          Showing {rangeStart + 1}&ndash;{rangeEnd} of {lines.length}
        </span>
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-auto font-mono text-[12px] leading-[1.65]">
        {/* Expand up button */}
        {rangeStart > 0 && (
          <button
            onClick={handleExpandUp}
            className="flex w-full items-center justify-center gap-1 border-b border-white/[0.04] py-1.5 text-[10px] text-white/30 transition-colors hover:bg-white/[0.03] hover:text-white/50"
          >
            <ChevronUp className="size-3" />
            Show {Math.min(EXPAND_CHUNK, rangeStart)} more lines above
          </button>
        )}

        {/* Lines */}
        <div className="relative">
          {visibleLines.map((line, i) => {
            const lineNumber = rangeStart + i;
            const isHighlighted =
              matchLineIndex >= 0 &&
              lineNumber >= matchLineIndex &&
              lineNumber < matchLineIndex + matchLineCount;

            const tokens = tokenizeHtml(line);

            return (
              <div
                key={lineNumber}
                ref={isHighlighted && lineNumber === matchLineIndex ? highlightRef : undefined}
                className={cn(
                  "flex",
                  isHighlighted &&
                    "bg-[rgba(0,188,212,0.08)] border-l-2 border-cyan-400"
                )}
              >
                {/* Line number gutter */}
                <span
                  className={cn(
                    "shrink-0 select-none pr-4 text-right",
                    isHighlighted
                      ? "text-cyan-400/70 bg-[rgba(0,188,212,0.05)]"
                      : "text-white/15"
                  )}
                  style={{
                    width: `${gutterWidth + 3}ch`,
                    paddingLeft: "1ch",
                  }}
                >
                  {lineNumber + 1}
                </span>

                {/* Code content */}
                <span className="min-w-0 flex-1 whitespace-pre pr-4">
                  {tokens.map((token, ti) => (
                    <span key={ti} className={tokenColors[token.type]}>
                      {token.text}
                    </span>
                  ))}
                  {tokens.length === 0 && "\u00A0"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Expand down button */}
        {rangeEnd < lines.length && (
          <button
            onClick={handleExpandDown}
            className="flex w-full items-center justify-center gap-1 border-t border-white/[0.04] py-1.5 text-[10px] text-white/30 transition-colors hover:bg-white/[0.03] hover:text-white/50"
          >
            <ChevronDown className="size-3" />
            Show {Math.min(EXPAND_CHUNK, lines.length - rangeEnd)} more lines
            below
          </button>
        )}
      </div>
    </div>
  );
}
