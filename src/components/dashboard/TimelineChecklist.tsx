"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MilestoneStatus, TimelineMilestone } from "@/types/hdb";

const STATUS_OPTIONS: SelectOption<MilestoneStatus>[] = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const STATUS_VARIANT: Record<MilestoneStatus, "secondary" | "info" | "success"> = {
  pending: "secondary",
  "in-progress": "info",
  done: "success",
};

export function TimelineChecklist({
  timeline,
  onChange,
}: {
  timeline: TimelineMilestone[];
  onChange: (t: TimelineMilestone[]) => void;
}) {
  const update = (id: string, patch: Partial<TimelineMilestone>) =>
    onChange(timeline.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const doneCount = timeline.filter((m) => m.done).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>HDB resale timeline</CardTitle>
            <CardDescription>Track each milestone of your resale purchase.</CardDescription>
          </div>
          <Badge variant="outline">
            {doneCount}/{timeline.length} done
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {timeline.map((m, i) => (
            <li
              key={m.id}
              className={cn(
                "flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center",
                m.done && "bg-muted/40",
              )}
            >
              <div className="flex flex-1 items-start gap-3">
                <Checkbox
                  id={`tl-${m.id}`}
                  checked={m.done}
                  onCheckedChange={(done) =>
                    update(m.id, { done, status: done ? "done" : "pending" })
                  }
                  aria-label={`Mark ${m.title} done`}
                />
                <div className="min-w-0">
                  <label
                    htmlFor={`tl-${m.id}`}
                    className={cn(
                      "cursor-pointer text-sm font-medium",
                      m.done && "text-muted-foreground line-through",
                    )}
                  >
                    {i + 1}. {m.title}
                  </label>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:w-auto">
                <Input
                  type="date"
                  aria-label={`${m.title} date`}
                  value={m.date}
                  onChange={(e) => update(m.id, { date: e.target.value })}
                  className="h-8 w-[9.5rem] text-xs"
                />
                <div className="w-32">
                  <Select
                    value={m.status}
                    options={STATUS_OPTIONS}
                    onValueChange={(status) =>
                      update(m.id, { status, done: status === "done" })
                    }
                    aria-label={`${m.title} status`}
                  />
                </div>
                <Badge variant={STATUS_VARIANT[m.status]} className="hidden sm:inline-flex">
                  {STATUS_OPTIONS.find((s) => s.value === m.status)?.label}
                </Badge>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
