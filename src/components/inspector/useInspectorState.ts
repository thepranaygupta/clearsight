"use client";

import { useState, useCallback } from "react";

export type ViewMode = "page" | "html";

export interface InspectorState {
  isOpen: boolean;
  activeIssueId: string | null;
  viewMode: ViewMode;
  open: (issueId: string) => void;
  close: () => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveIssue: (issueId: string) => void;
}

export function useInspectorState(): InspectorState {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("page");

  const open = useCallback((issueId: string) => {
    setActiveIssueId(issueId);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIssueId(null);
  }, []);

  const setActiveIssue = useCallback((issueId: string) => {
    setActiveIssueId(issueId);
  }, []);

  return {
    isOpen,
    activeIssueId,
    viewMode,
    open,
    close,
    setViewMode,
    setActiveIssue,
  };
}
