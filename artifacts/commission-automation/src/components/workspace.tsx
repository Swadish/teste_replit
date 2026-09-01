import { type ComponentType, type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { BarChart3, Calculator, ChevronDown, CircleHelp, Database, DollarSign, FileSpreadsheet, Gauge, KeyRound, Layers3, LifeBuoy, Menu, MoreHorizontal, Plus, Radio, Settings2, Share2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const navItems = [
  { href: '/', label: 'Overview', icon: Gauge },
  { href: '/datasources', label: 'Data sources', icon: Database },
  { href: '/calculations', label: 'Calculations', icon: Calculator },
  { href: '/dashboards', label: 'Dashboards', icon: BarChart3 },
  { href: '/payments', label: 'Payments', icon: DollarSign },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <div className={cn('flex items-center gap-3', compact && 'gap-2')}>
    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary shadow-[3px_3px_0_hsl(var(--sidebar))]">
      <span className="absolute left-[9px] top-[9px] h-2 w-2 rounded-full bg-primary" />
      <span className="absolute bottom-[9px] right-[9px] h-2 w-2 rounded-full bg-primary" />
      <span className="h-[2px] w-4 rotate-45 rounded-full bg-primary" />
    </div>
    {!compact && <div><div className="display text-[15px] font-bold tracking-tight text-sidebar-foreground">ledgerline</div><div className="mono text-[9px] uppercase tracking-[.18em] text-sidebar-foreground/45">commission ops</div></div>}
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useStateSafe(false);
  const current = navItems.find((item) => item.href === location)?.label ?? 'Overview';
  return <div className="grain flex min-h-[100dvh] bg-background">
    <aside className={cn('fixed inset-y-0 left-0 z-30 flex w-[250px] -translate-x-full flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 transition-transform duration-300 md:static md:translate-x-0', mobileOpen && 'translate-x-0')}>
      <div className="flex items-center justify-between px-2"><BrandMark /><button data-testid="button-close-navigation" className="focus-ring rounded-md p-1 text-sidebar-foreground/60 md:hidden" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="mt-10 px-2"><div className="mono mb-3 text-[9px] uppercase tracking-[.2em] text-sidebar-foreground/35">Workspace</div>
        <nav className="space-y-1">{navItems.map(({ href, label, icon: Icon }) => <Link data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} key={href} href={href} onClick={() => setMobileOpen(false)} className={cn('group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 focus-ring', location === href ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_hsl(var(--sidebar-primary))]' : 'text-sidebar-foreground/55 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground')}><Icon size={16} strokeWidth={1.8} /><span>{label}</span>{location === href && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}</Link>)}</nav>
      </div>
      <div className="mt-auto space-y-5 px-2">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3.5"><div className="flex items-center gap-2 text-[11px] font-semibold text-sidebar-foreground"><span className="h-2 w-2 rounded-full bg-[#9bd4b8] shadow-[0_0_0_3px_rgba(155,212,184,.14)]" />All systems nominal</div><p className="mt-2 text-[11px] leading-relaxed text-sidebar-foreground/45">Last checked 42 seconds ago</p></div>
        <div className="space-y-1 border-t border-sidebar-border pt-4"><button data-testid="button-help" className="focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"><LifeBuoy size={15} />Help center</button><button data-testid="button-settings" className="focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"><Settings2 size={15} />Workspace settings</button></div>
        <div className="flex items-center gap-3 border-t border-sidebar-border pt-4"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c2d6ca] text-xs font-bold text-[#234439]">MC</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-sidebar-foreground">Mara Chen</div><div className="truncate text-[10px] text-sidebar-foreground/40">Finance operations</div></div><ChevronDown size={14} className="text-sidebar-foreground/40" /></div>
      </div>
    </aside>
    {mobileOpen && <button aria-label="Close menu" data-testid="button-menu-backdrop" className="fixed inset-0 z-20 bg-primary/25 md:hidden" onClick={() => setMobileOpen(false)} />}
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-xl md:px-9">
        <div className="flex items-center gap-3"><button data-testid="button-open-navigation" className="focus-ring rounded-lg p-2 text-muted-foreground md:hidden" onClick={() => setMobileOpen(true)}><Menu size={19} /></button><div className="hidden text-xs font-semibold text-muted-foreground md:block"><span className="text-muted-foreground/60">Workspace</span><span className="mx-2 text-border">/</span><span className="text-foreground">{current}</span></div></div>
        <div className="flex items-center gap-2.5"><button data-testid="button-command-menu" className="focus-ring hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[11px] font-semibold text-muted-foreground transition hover:border-muted-foreground/40 sm:flex"><KeyRound size={13} /><span>Quick find</span><kbd className="mono ml-4 rounded bg-muted px-1.5 py-0.5 text-[9px]">⌘ K</kbd></button><button data-testid="button-notifications" className="focus-ring relative rounded-lg p-2 text-muted-foreground transition hover:bg-muted"><Radio size={17} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#de765d]" /></button><div className="ml-1 hidden h-7 w-px bg-border sm:block" /><button data-testid="button-profile" className="focus-ring flex items-center gap-2 rounded-lg p-1 transition hover:bg-muted"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c2d6ca] text-[10px] font-extrabold text-[#234439]">MC</span><ChevronDown size={13} className="text-muted-foreground" /></button></div>
      </header>
      <div className="mx-auto max-w-[1480px] px-5 py-7 md:px-9 md:py-9">{children}</div>
    </main>
  </div>;
}

function useStateSafe(initial: boolean): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState(initial);
  return [value, setValue];
}

export function PageHeader({ eyebrow, title, description, action, actionLabel, onAction }: { eyebrow: string; title: string; description?: string; action?: ReactNode; actionLabel?: string; onAction?: () => void }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div className="animate-rise"><div className="mono mb-2 text-[10px] font-medium uppercase tracking-[.2em] text-muted-foreground">{eyebrow}</div><h1 className="display text-3xl font-bold tracking-[-.04em] text-foreground md:text-[38px]">{title}</h1>{description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>}</div>{action ?? (actionLabel && <Button data-testid={`button-${actionLabel.toLowerCase().replaceAll(' ', '-')}`} onClick={onAction} className="self-start rounded-lg bg-primary text-primary-foreground shadow-none lg:self-auto"><Plus size={16} />{actionLabel}</Button>)}</div>;
}

export function SectionLabel({ children, detail }: { children: ReactNode; detail?: string }) {
  return <div className="mb-3 flex items-center justify-between"><h2 className="display text-sm font-bold tracking-[-.01em]">{children}</h2>{detail && <span className="mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">{detail}</span>}</div>;
}

export function StatusPill({ status }: { status: string }) {
  const tone = status.includes('active') || status.includes('connected') || status.includes('paid') || status.includes('delivered') || status.includes('completed') || status === 'exported' ? 'bg-[#e2f0e8] text-[#2c6650]' : status.includes('attention') || status.includes('failed') || status.includes('needs') ? 'bg-[#f8e5dc] text-[#9a4b38]' : status.includes('sync') || status.includes('processing') ? 'bg-[#f7eed2] text-[#8c6921]' : 'bg-muted text-muted-foreground';
  const label = status.replaceAll('_', ' ');
  return <span data-testid={`status-${status}`} className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize tracking-wide', tone)}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />{label}</span>;
}

export function EmptyState({ icon: Icon = Layers3, title, detail, action, onAction }: { icon?: ComponentType<{ size?: number }>; title: string; detail: string; action?: string; onAction?: () => void }) {
  return <div className="flex min-h-[270px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/45 px-5 text-center"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Icon size={21} /></div><h3 className="display text-sm font-bold">{title}</h3><p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">{detail}</p>{action && <Button data-testid="button-empty-action" onClick={onAction} className="mt-5 h-8 rounded-lg bg-primary px-3 text-xs text-primary-foreground"><Plus size={13} />{action}</Button>}</div>;
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-[#e7c9bd] bg-[#fff7f3] px-5 text-center"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f8e5dc] text-[#9a4b38]"><CircleHelp size={19} /></div><h3 className="display text-sm font-bold text-[#723e31]">Something needs a second look</h3><p className="mt-1 text-xs text-[#9a6558]">We couldn’t load this workspace view.</p>{onRetry && <Button data-testid="button-retry" onClick={onRetry} variant="outline" size="sm" className="mt-4 border-[#e7c9bd] bg-transparent text-[#723e31]">Try again</Button>}</div>;
}

export function LoadingRows({ count = 4 }: { count?: number }) {
  return <div className="space-y-3" data-testid="loading-state">{Array.from({ length: count }).map((_, i) => <div key={i} className="flex animate-pulse items-center gap-4 rounded-xl border border-border bg-card p-4"><div className="h-9 w-9 rounded-lg bg-muted" /><div className="flex-1"><div className="h-3 w-1/3 rounded bg-muted" /><div className="mt-2 h-2 w-1/2 rounded bg-muted" /></div><div className="h-6 w-20 rounded-full bg-muted" /></div>)}</div>;
}

export function Sparkline({ values, color = '#25334b', fill = false }: { values: number[]; color?: string; fill?: boolean }) {
  const max = Math.max(...values, 1); const min = Math.min(...values, 0); const range = max - min || 1;
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${38 - ((value - min) / range) * 30}`).join(' ');
  return <svg viewBox="0 0 100 42" preserveAspectRatio="none" className="h-full w-full overflow-visible"><defs><linearGradient id="line-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".18" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>{fill && <polygon points={`0,42 ${points} 100,42`} fill="url(#line-fill)" /> }<polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" /></svg>;
}

export function MetricCard({ label, value, delta, detail, values, accent = 'navy' }: { label: string; value: string; delta?: string; detail?: string; values?: number[]; accent?: 'navy' | 'gold' | 'mint' | 'coral' }) {
  const color = accent === 'gold' ? '#b78528' : accent === 'mint' ? '#4c9476' : accent === 'coral' ? '#c96952' : '#25334b';
  return <div className="panel-shadow animate-rise relative overflow-hidden rounded-xl border border-card-border bg-card p-5"><div className="flex items-start justify-between"><div><div className="text-[11px] font-semibold text-muted-foreground">{label}</div><div data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`} className="display mt-2 text-[27px] font-bold tracking-[-.05em]">{value}</div></div>{delta && <span className={cn('rounded-full px-2 py-1 text-[10px] font-bold', delta.startsWith('+') ? 'bg-[#e2f0e8] text-[#2c6650]' : 'bg-[#f8e5dc] text-[#9a4b38]')}>{delta}</span>}</div>{values && <div className="mt-3 h-9"><Sparkline values={values} color={color} fill /></div>}{detail && <div className="mt-3 text-[10px] text-muted-foreground">{detail}</div>}<div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[.07]" style={{ backgroundColor: color }} /></div>;
}

export function ActionMenu({ onEdit, onDelete, editLabel = 'Edit' }: { onEdit?: () => void; onDelete?: () => void; editLabel?: string }) {
  return <div className="flex items-center gap-1"><button data-testid="button-more-actions" className="focus-ring rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"><MoreHorizontal size={16} /></button><div className="hidden">{editLabel}{onEdit ? 'edit' : ''}{onDelete ? 'delete' : ''}</div></div>;
}

export function ToastNote({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="fixed bottom-5 right-5 z-50 flex animate-rise items-center gap-3 rounded-xl border border-[#b9d7c8] bg-[#edf8f1] px-4 py-3 text-xs font-semibold text-[#2c6650] shadow-xl"><Sparkles size={15} /><span>{message}</span><button data-testid="button-close-toast" className="ml-2 focus-ring rounded p-0.5" onClick={onClose}><X size={13} /></button></div>;
}

export const iconForActivity = (type: string) => type === 'sync' ? FileSpreadsheet : type === 'calculation' ? Calculator : type === 'dashboard' ? BarChart3 : type === 'payment' ? DollarSign : Share2;