"use client";

import { useState, useMemo } from "react";
import {
  ArrowDownWideNarrow,
  Filter,
  ChevronDown,
  Check,
  ShieldAlert,
  HelpCircle,
  SearchX,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { IssueGroup } from "./IssueGroup";
import type { Issue, Severity } from "@/lib/types";

const severityOrder: Record<Severity, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

const severityColors: Record<Severity, string> = {
  critical: "bg-red-500",
  serious: "bg-orange-500",
  moderate: "bg-yellow-500",
  minor: "bg-blue-400",
};

interface IssueGroupData {
  ruleId: string;
  ruleHelp: string;
  wcagCriterion: string;
  wcagLevel: string;
  worstSeverity: Severity;
  issues: Issue[];
}

function groupIssues(issues: Issue[]): IssueGroupData[] {
  const groups = new Map<string, Issue[]>();

  for (const issue of issues) {
    const key = issue.ruleId ?? issue.axeRuleId ?? issue.wcagCriterion;
    const existing = groups.get(key) || [];
    existing.push(issue);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(([key, groupIssues]) => {
    const worstSeverity = groupIssues.reduce((worst, issue) => {
      return severityOrder[issue.severity] < severityOrder[worst]
        ? issue.severity
        : worst;
    }, groupIssues[0].severity);

    const ruleHelp = groupIssues[0].ruleHelp ?? groupIssues[0].description;

    return {
      ruleId: key,
      ruleHelp,
      wcagCriterion: groupIssues[0].wcagCriterion,
      wcagLevel: groupIssues[0].wcagLevel,
      worstSeverity,
      issues: groupIssues.sort(
        (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
      ),
    };
  });
}

interface IssueTabsProps {
  issues: Issue[];
  onInspect?: (issueId: string) => void;
}

type SortKey = "severity" | "confidence";
type FilterSeverity = "all" | Severity;

const severityLabels: Record<FilterSeverity, string> = {
  all: "All severities",
  critical: "Critical",
  serious: "Serious",
  moderate: "Moderate",
  minor: "Minor",
};

const sortLabels: Record<SortKey, string> = {
  severity: "Severity",
  confidence: "Confidence",
};

function CountBadge({ count, active }: { count: number; active?: boolean }) {
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "bg-foreground/[0.06] text-muted-foreground"
      )}
    >
      {count}
    </span>
  );
}

function EmptyState({ type }: { type: "confirmed" | "potential" }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/60">
        <SearchX className="size-5 text-muted-foreground/60" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        No {type} issues found
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60">
        {type === "confirmed"
          ? "Great news — no confirmed violations detected"
          : "No potential issues flagged by AI analysis"}
      </p>
    </div>
  );
}

function IssueList({ groups, onInspect }: { groups: IssueGroupData[]; onInspect?: (issueId: string) => void }) {
  if (groups.length === 0) return null;

  const totalIssues = groups.reduce((sum, g) => sum + g.issues.length, 0);

  return (
    <div>
      {/* Column header */}
      <div className="mb-1 flex items-center gap-3 border-b border-border/40 px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        <span className="w-3.5" /> {/* chevron spacer */}
        <span className="w-2" /> {/* dot spacer */}
        <span className="flex-1">Rule</span>
        <span className="hidden sm:block">WCAG</span>
        <span className="hidden sm:block">Severity</span>
        <span className="min-w-8 text-right">
          {totalIssues}
        </span>
      </div>

      {/* Group rows */}
      <div className="divide-y divide-border/20">
        {groups.map((group) => (
          <IssueGroup
            key={group.ruleId}
            ruleId={group.ruleId}
            ruleHelp={group.ruleHelp}
            wcagCriterion={group.wcagCriterion}
            wcagLevel={group.wcagLevel}
            worstSeverity={group.worstSeverity}
            issues={group.issues}
            onInspect={onInspect}
          />
        ))}
      </div>
    </div>
  );
}

export function IssueTabs({ issues, onInspect }: IssueTabsProps) {
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>("all");
  const [sortKey, setSortKey] = useState<SortKey>("severity");
  const [activeTab, setActiveTab] = useState("confirmed");

  const confirmed = useMemo(
    () => issues.filter((i) => i.type === "confirmed"),
    [issues]
  );
  const potential = useMemo(
    () => issues.filter((i) => i.type === "potential"),
    [issues]
  );

  function filterAndGroup(list: Issue[]): IssueGroupData[] {
    const filtered =
      filterSeverity === "all"
        ? list
        : list.filter((i) => i.severity === filterSeverity);

    const groups = groupIssues(filtered);

    groups.sort((a, b) => {
      if (sortKey === "confidence") {
        const avgA =
          a.issues.reduce((sum, i) => sum + (i.confidenceScore ?? 1), 0) /
          a.issues.length;
        const avgB =
          b.issues.reduce((sum, i) => sum + (i.confidenceScore ?? 1), 0) /
          b.issues.length;
        return avgB - avgA;
      }
      const sevDiff =
        severityOrder[a.worstSeverity] - severityOrder[b.worstSeverity];
      if (sevDiff !== 0) return sevDiff;
      return b.issues.length - a.issues.length;
    });

    return groups;
  }

  const filteredConfirmed = filterAndGroup(confirmed);
  const filteredPotential = filterAndGroup(potential);

  // Severity breakdown for the active tab
  const activeList = activeTab === "confirmed" ? confirmed : potential;
  const severityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    };
    for (const issue of activeList) {
      counts[issue.severity] = (counts[issue.severity] || 0) + 1;
    }
    return counts;
  }, [activeList]);

  return (
    <Tabs
      defaultValue="confirmed"
      onValueChange={(val) => setActiveTab(val as string)}
    >
      {/* Toolbar */}
      <div className="space-y-3">
        {/* Row 1: Tabs + controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList variant="line">
            <TabsTrigger value="confirmed">
              <ShieldAlert className="size-3.5" />
              Confirmed
              <CountBadge
                count={confirmed.length}
                active={activeTab === "confirmed"}
              />
            </TabsTrigger>
            <TabsTrigger value="potential">
              <HelpCircle className="size-3.5" />
              Potential
              <CountBadge
                count={potential.length}
                active={activeTab === "potential"}
              />
            </TabsTrigger>
          </TabsList>

          {/* Filter & Sort */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors hover:bg-muted",
                  filterSeverity !== "all"
                    ? "border-primary/30 bg-primary/[0.04] text-primary"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                <Filter className="size-3" />
                {severityLabels[filterSeverity]}
                <ChevronDown className="size-3 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="min-w-[200px]"
              >
                <DropdownMenuGroup>
                  <span className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
                    Filter by severity
                  </span>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={filterSeverity}
                  onValueChange={(val) =>
                    setFilterSeverity(val as FilterSeverity)
                  }
                >
                  <DropdownMenuRadioItem value="all">
                    All severities
                  </DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  {(
                    ["critical", "serious", "moderate", "minor"] as Severity[]
                  ).map((sev) => (
                    <DropdownMenuRadioItem key={sev} value={sev}>
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-block size-2 rounded-full",
                            severityColors[sev]
                          )}
                        />
                        {severityLabels[sev]}
                        <span className="ml-auto pl-4 text-[11px] tabular-nums text-muted-foreground">
                          {severityBreakdown[sev] || 0}
                        </span>
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
                <ArrowDownWideNarrow className="size-3" />
                {sortLabels[sortKey]}
                <ChevronDown className="size-3 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="min-w-[200px]"
              >
                <DropdownMenuGroup>
                  <span className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
                    Sort by
                  </span>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortKey}
                  onValueChange={(val) => setSortKey(val as SortKey)}
                >
                  <DropdownMenuRadioItem value="severity">
                    Severity (highest first)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="confidence">
                    Confidence score
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2: Severity breakdown chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["critical", "serious", "moderate", "minor"] as Severity[]).map(
            (sev) => {
              const count = severityBreakdown[sev] || 0;
              if (count === 0) return null;
              const isActive = filterSeverity === sev;
              return (
                <button
                  key={sev}
                  onClick={() =>
                    setFilterSeverity(isActive ? "all" : sev)
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                    isActive
                      ? "border border-primary/30 bg-primary/[0.06] text-primary shadow-sm"
                      : "border border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-1.5 rounded-full",
                      severityColors[sev]
                    )}
                  />
                  <span className="capitalize">{sev}</span>
                  <span className="tabular-nums opacity-60">{count}</span>
                  {isActive && <Check className="size-3" />}
                </button>
              );
            }
          )}
          {filterSeverity !== "all" && (
            <button
              onClick={() => setFilterSeverity("all")}
              className="ml-1 text-xs text-muted-foreground/60 underline-offset-2 hover:text-muted-foreground hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Issue lists */}
      <TabsContent value="confirmed" className="mt-4">
        {filteredConfirmed.length === 0 ? (
          <EmptyState type="confirmed" />
        ) : (
          <IssueList groups={filteredConfirmed} onInspect={onInspect} />
        )}
      </TabsContent>

      <TabsContent value="potential" className="mt-4">
        {filteredPotential.length === 0 ? (
          <EmptyState type="potential" />
        ) : (
          <IssueList groups={filteredPotential} onInspect={onInspect} />
        )}
      </TabsContent>
    </Tabs>
  );
}
