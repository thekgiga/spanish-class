/**
 * UI System showcase — internal route at /design-system.
 * Demonstrates the Editorial Teaching Studio token layer and canonical primitives.
 * Not customer-facing; not linked from public nav.
 */
import React from "react";
import { Settings, Trash2, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { UiLifecycleStatus } from "@/lib/ui-system/status";

const ALL_STATUSES: UiLifecycleStatus[] = [
  "available", "requested", "confirmed", "blocked", "completed", "cancelled",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-h3 font-semibold text-ink border-b border-line pb-2">{title}</h2>
      {children}
    </section>
  );
}

export function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-canvas px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-1">
          <p className="text-caption text-ink-tertiary uppercase tracking-widest font-semibold">Internal</p>
          <h1 className="text-h1 font-semibold text-ink">Editorial Teaching Studio</h1>
          <p className="text-body text-ink-secondary">
            Token layer v2 · Canonical primitives · Phase 1 foundation
          </p>
        </header>

        {/* ── Color tokens ─────────────────────────────────────────────── */}
        <Section title="Semantic color tokens">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { name: "canvas",         cls: "bg-canvas border border-line" },
              { name: "surface",        cls: "bg-surface border border-line" },
              { name: "surface-muted",  cls: "bg-surface-muted border border-line" },
              { name: "surface-raised", cls: "bg-surface-raised border border-line" },
            ].map(({ name, cls }) => (
              <div key={name} className={`${cls} rounded-ui-sm p-3`}>
                <p className="text-caption text-ink font-mono">{name}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { name: "brand",   cls: "bg-brand text-brand-contrast" },
              { name: "accent",  cls: "bg-accent text-ink-inverse" },
              { name: "focus",   cls: "bg-focus text-ink-inverse" },
            ].map(({ name, cls }) => (
              <div key={name} className={`${cls} rounded-ui-sm p-3`}>
                <p className="text-caption font-mono">{name}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Status tones ─────────────────────────────────────────────── */}
        <Section title="Status tones (semantic lifecycle)">
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map(s => <StatusBadge key={s} status={s} variant="tag" />)}
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map(s => <StatusBadge key={s} status={s} variant="pill" />)}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ALL_STATUSES.map(s => (
              <Card key={s} variant="status" statusTone={s} className="px-4 py-3">
                <p className="text-small font-medium capitalize">{s}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* ── Typography ───────────────────────────────────────────────── */}
        <Section title="Typography scale">
          {[
            { cls: "text-display",  label: "display — 48px" },
            { cls: "text-h1",       label: "h1 — 32px" },
            { cls: "text-h2",       label: "h2 — 24px" },
            { cls: "text-h3",       label: "h3 — 20px" },
            { cls: "text-title",    label: "title — 17px" },
            { cls: "text-body",     label: "body — 15px" },
            { cls: "text-small",    label: "small — 13px" },
            { cls: "text-caption",  label: "caption — 12px" },
            { cls: "text-micro",    label: "micro — 11px" },
          ].map(({ cls, label }) => (
            <p key={cls} className={`${cls} text-ink leading-tight`}>{label}</p>
          ))}
        </Section>

        {/* ── Button ───────────────────────────────────────────────────── */}
        <Section title="Button variants + states">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="quiet">Quiet</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" isLoading>Loading…</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        {/* ── IconButton ───────────────────────────────────────────────── */}
        <Section title="IconButton">
          <div className="flex items-center gap-3">
            <IconButton label="Settings"><Settings className="h-4 w-4" /></IconButton>
            <IconButton label="Notifications" variant="secondary"><Bell className="h-4 w-4" /></IconButton>
            <IconButton label="Delete" variant="danger"><Trash2 className="h-4 w-4" /></IconButton>
            <IconButton label="Disabled" disabled><Settings className="h-4 w-4" /></IconButton>
          </div>
        </Section>

        {/* ── Input ────────────────────────────────────────────────────── */}
        <Section title="Input states">
          <div className="space-y-3 max-w-sm">
            <Input placeholder="Default" />
            <Input placeholder="With icon" icon={<Search className="h-4 w-4" />} />
            <Input placeholder="Error" defaultValue="bad" error="This field is required." />
            <Input placeholder="Disabled" disabled />
            <Input defaultValue="Read-only value" readOnly />
          </div>
        </Section>

        {/* ── Textarea ─────────────────────────────────────────────────── */}
        <Section title="Textarea states">
          <div className="space-y-3 max-w-sm">
            <Textarea placeholder="Default textarea" />
            <Textarea placeholder="With character count" showCount maxLength={200} />
            <Textarea placeholder="Error state" error="At least 10 characters required." />
            <Textarea placeholder="Disabled" disabled />
          </div>
        </Section>

        {/* ── Card variants ────────────────────────────────────────────── */}
        <Section title="Card variants">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card variant="plain">
              <CardHeader>
                <CardTitle>Plain</CardTitle>
                <CardDescription>Surface + border + shadow-1</CardDescription>
              </CardHeader>
            </Card>
            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive</CardTitle>
                <CardDescription>Hover to lift</CardDescription>
              </CardHeader>
            </Card>
            <Card variant="selected">
              <CardHeader>
                <CardTitle>Selected</CardTitle>
                <CardDescription>Brand border + ring</CardDescription>
              </CardHeader>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated</CardTitle>
                <CardDescription>Shadow-2, no border</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}
