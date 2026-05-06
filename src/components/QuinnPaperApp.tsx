/**
 * Quinn Paper — Ollama-inspired clean documentation aesthetic
 * Wired to the existing Gemini service (auth via .env)
 *
 * Self-contained: tokens, icons, brand mark, pill buttons, sidebar,
 * topbar, empty state, message bubbles, tool steps, citations,
 * KPI cards, sparkline, deal card — all in one file.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateContentStream } from '../services/gemini';
import type { Message, GenerativeUIData, CitationSource } from '../types';
import { GenerativeUI } from './GenerativeUI';
import AdminPanel from './AdminPanel';
import { getSessionId, logChatTurn, logSearch } from '../lib/supabase';

/* ---------- Responsive helper ---------- */
const MOBILE_BREAKPOINT = 768;

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e: MediaQueryListEvent): void => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

/* ---------- File helpers ---------- */
interface AttachedFile {
  name: string;
  size: string;
  mimeType: string;
  /** base64 (no data: prefix) */
  data: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileToAttached(file: File): Promise<AttachedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File read failed'));
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.split(',')[1] || '';
      resolve({
        name: file.name,
        size: formatFileSize(file.size),
        mimeType: file.type || 'application/octet-stream',
        data: base64,
      });
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- Tokens ---------- */
const T = {
  ink: '#000000',
  inkDeep: '#090909',
  charcoal: '#525252',
  body: '#737373',
  mute: '#a3a3a3',
  canvas: '#ffffff',
  surfaceSoft: '#fafafa',
  surfaceSofter: '#f5f5f5',
  hairline: '#e5e5e5',
  hairlineStrong: '#d4d4d4',
  up: '#15803d',
  down: '#b91c1c',
} as const;

const FONT_DISPLAY =
  '"SF Pro Rounded","Nunito",system-ui,-apple-system,"Segoe UI",sans-serif';
const FONT_BODY =
  'ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,sans-serif';
const FONT_MONO =
  'ui-monospace,"JetBrains Mono",SFMono-Regular,Menlo,Consolas,monospace';

/* ---------- Icon ---------- */
type IconName =
  | 'plus'
  | 'paperclip'
  | 'search'
  | 'fileText'
  | 'book'
  | 'database'
  | 'chart'
  | 'check'
  | 'copy'
  | 'share'
  | 'refresh'
  | 'arrowUp'
  | 'arrowRight'
  | 'download'
  | 'x'
  | 'lock'
  | 'calc'
  | 'tool'
  | 'list'
  | 'moreH'
  | 'trendUp'
  | 'trendDown'
  | 'sparkle';

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: React.CSSProperties;
}

function Icon({ name, size = 16, stroke = 1.6, style }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style,
  };
  const paths: Record<IconName, React.ReactNode> = {
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    paperclip: (
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 17.93 8.83l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    fileText: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </>
    ),
    book: (
      <>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14a9 3 0 0 0 18 0V5" />
        <path d="M3 12a9 3 0 0 0 18 0" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 4 5-5" />
      </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    copy: (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </>
    ),
    refresh: (
      <>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </>
    ),
    arrowUp: (
      <>
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </>
    ),
    arrowRight: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5" />
        <path d="M12 15V3" />
      </>
    ),
    x: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
    lock: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
    calc: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" x2="16" y1="6" y2="6" />
        <line x1="8" x2="8" y1="14" y2="14" />
        <line x1="12" x2="12" y1="14" y2="14" />
        <line x1="16" x2="16" y1="14" y2="14" />
        <line x1="8" x2="8" y1="18" y2="18" />
      </>
    ),
    tool: (
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    ),
    list: (
      <>
        <line x1="8" x2="21" y1="6" y2="6" />
        <line x1="8" x2="21" y1="12" y2="12" />
        <line x1="8" x2="21" y1="18" y2="18" />
        <line x1="3" x2="3.01" y1="6" y2="6" />
        <line x1="3" x2="3.01" y1="12" y2="12" />
        <line x1="3" x2="3.01" y1="18" y2="18" />
      </>
    ),
    moreH: (
      <>
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </>
    ),
    trendUp: (
      <>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </>
    ),
    trendDown: (
      <>
        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
        <polyline points="16 17 22 17 22 11" />
      </>
    ),
    sparkle: <path d="M12 3 14 9l6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

/* ---------- Brand Mark ---------- */
function QuinnMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12 2.5 L20.5 7.25 L20.5 16.75 L12 21.5 L3.5 16.75 L3.5 7.25 Z"
        stroke={T.ink}
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="12" cy="12" r="2.4" fill={T.ink} />
    </svg>
  );
}

/* ---------- Pill Button ---------- */
type PillVariant = 'primary' | 'secondary' | 'ghost' | 'soft';
type PillSize = 'sm' | 'md' | 'lg';

interface PillButtonProps {
  children?: React.ReactNode;
  icon?: IconName;
  variant?: PillVariant;
  size?: PillSize;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

function PillButton({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  style,
  title,
}: PillButtonProps) {
  const sizes: Record<PillSize, { h: number; padX: number; fs: number }> = {
    sm: { h: 30, padX: 14, fs: 13 },
    md: { h: 36, padX: 20, fs: 14 },
    lg: { h: 44, padX: 24, fs: 15 },
  };
  const s = sizes[size];
  const variants: Record<
    PillVariant,
    { bg: string; fg: string; border: string; hov: string }
  > = {
    primary: { bg: T.ink, fg: T.canvas, border: T.ink, hov: T.inkDeep },
    secondary: {
      bg: T.canvas,
      fg: T.ink,
      border: T.hairlineStrong,
      hov: T.surfaceSoft,
    },
    ghost: { bg: 'transparent', fg: T.ink, border: 'transparent', hov: T.surfaceSoft },
    soft: { bg: T.surfaceSoft, fg: T.ink, border: T.surfaceSoft, hov: T.canvas },
  };
  const v = variants[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = v.hov;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = v.bg;
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: s.h,
        padding: `0 ${s.padX}px`,
        borderRadius: 9999,
        background: disabled ? T.surfaceSoft : v.bg,
        color: disabled ? T.mute : v.fg,
        border: `1px solid ${disabled ? T.hairline : v.border}`,
        fontFamily: FONT_BODY,
        fontSize: s.fs,
        fontWeight: 500,
        lineHeight: 1,
        cursor: disabled ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background .15s',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={s.fs} stroke={1.75} />}
      {children}
    </button>
  );
}

/* ---------- Markdown → HTML ---------- */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineMd(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function renderMarkdown(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (
      /^\s*\|.*\|\s*$/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|?\s*:?-+/.test(lines[i + 1])
    ) {
      const head = line
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(
          lines[i]
            .trim()
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((c) => c.trim()),
        );
        i++;
      }
      out.push(
        '<table><thead><tr>' +
          head.map((h) => `<th>${inlineMd(h)}</th>`).join('') +
          '</tr></thead><tbody>' +
          rows
            .map(
              (r) =>
                '<tr>' +
                r.map((c) => `<td>${inlineMd(c)}</td>`).join('') +
                '</tr>',
            )
            .join('') +
          '</tbody></table>',
      );
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const lvl = Math.min(h[1].length + 2, 4);
      out.push(`<h${lvl}>${inlineMd(h[2])}</h${lvl}>`);
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      out.push(
        '<ul>' + items.map((it) => `<li>${inlineMd(it)}</li>`).join('') + '</ul>',
      );
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      out.push(
        '<ol>' + items.map((it) => `<li>${inlineMd(it)}</li>`).join('') + '</ol>',
      );
      continue;
    }
    if (line.trim() === '') {
      i++;
      continue;
    }
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*\|.*\|\s*$/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${inlineMd(para.join(' '))}</p>`);
  }
  return out.join('');
}

/* ---------- Tool step ---------- */
type ToolName = 'database' | 'book' | 'chart' | 'fileText' | 'calc' | 'search';
type ToolStatus = 'running' | 'done';

interface ToolStepData {
  tool: ToolName;
  label: string;
  status: ToolStatus;
  detail?: string;
}

function ToolStep({ tool, label, status, detail }: ToolStepData) {
  const isDone = status === 'done';
  const isRunning = status === 'running';
  // Map ToolName → IconName (book, chart, fileText, calc are valid IconName; database, search are valid)
  const iconName: IconName = tool;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 14px',
        borderRadius: 9999,
        background: T.surfaceSoft,
        fontSize: 13,
      }}
    >
      <Icon
        name={iconName}
        size={13}
        stroke={1.6}
        style={{
          color: isDone ? T.ink : T.charcoal,
          animation: isRunning ? 'spin 1.4s linear infinite' : 'none',
        }}
      />
      <span style={{ color: T.ink, fontWeight: 500 }}>{label}</span>
      {detail && (
        <span style={{ color: T.mute, fontFamily: FONT_MONO, fontSize: 12 }}>
          {detail}
        </span>
      )}
      <div style={{ flex: 1 }} />
      {isDone && (
        <Icon name="check" size={12} stroke={2.5} style={{ color: T.ink }} />
      )}
      {isRunning && (
        <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
          <span className="qp-dot" style={{ animationDelay: '0s' }} />
          <span className="qp-dot" style={{ animationDelay: '0.15s' }} />
          <span className="qp-dot" style={{ animationDelay: '0.3s' }} />
        </span>
      )}
    </div>
  );
}

/* ---------- Citations ---------- */
function Citations({ sources }: { sources: CitationSource[] }) {
  if (!sources?.length) return null;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
      }}
    >
      {sources.map((s, i) => (
        <a
          key={i}
          href="#"
          onClick={(e) => e.preventDefault()}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.ink)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.hairline)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px 5px 5px',
            borderRadius: 9999,
            background: T.canvas,
            border: `1px solid ${T.hairline}`,
            textDecoration: 'none',
            color: T.ink,
            fontSize: 13,
            transition: 'border-color .15s',
            maxWidth: 320,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: 9999,
              background: T.ink,
              color: T.canvas,
              fontSize: 10,
              fontWeight: 600,
              fontFamily: FONT_MONO,
            }}
          >
            {i + 1}
          </span>
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {s.document}
          </span>
          {s.section && (
            <span style={{ color: T.mute, fontFamily: FONT_MONO, fontSize: 11 }}>
              {s.section}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}

/* ---------- Attachment preview + Encompass push ---------- */
type PushState = 'idle' | 'pushing' | 'sent' | 'error';

function AttachmentPreview({ file }: { file: AttachedFile }) {
  const [pushState, setPushState] = useState<PushState>('idle');
  const [pushMsg, setPushMsg] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';
  const dataUrl = `data:${file.mimeType};base64,${file.data}`;

  const openInTab = (): void => {
    const blob = b64ToBlob(file.data, file.mimeType);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const sendToEncompass = async (): Promise<void> => {
    const loanNumber = window.prompt(
      'Encompass loan number to attach this document to:',
    );
    if (!loanNumber) return;
    setPushState('pushing');
    setPushMsg('');
    try {
      const res = await fetch('/api/encompass/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanNumber: loanNumber.trim(),
          name: file.name,
          mimeType: file.mimeType,
          data: file.data,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (json.ok) {
        setPushState('sent');
        setPushMsg(`Pushed to loan ${loanNumber.trim()}`);
      } else {
        setPushState('error');
        setPushMsg(json.error || 'Encompass push failed');
      }
    } catch (err: unknown) {
      setPushState('error');
      setPushMsg(err instanceof Error ? err.message : 'Network error');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        maxWidth: 320,
      }}
    >
      {/* Inline preview for images */}
      {isImage && (
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          style={{
            padding: 0,
            border: `1px solid ${T.hairline}`,
            borderRadius: 12,
            overflow: 'hidden',
            background: T.canvas,
            cursor: 'zoom-in',
            maxWidth: 320,
          }}
        >
          <img
            src={dataUrl}
            alt={file.name}
            style={{
              display: 'block',
              maxWidth: showPreview ? 320 : 240,
              maxHeight: showPreview ? 320 : 160,
              transition: 'max-width .2s, max-height .2s',
            }}
          />
        </button>
      )}

      {/* File chip */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 9999,
          background: T.surfaceSoft,
          border: `1px solid ${T.hairline}`,
          fontSize: 12,
          color: T.charcoal,
          maxWidth: 320,
        }}
      >
        <Icon name="fileText" size={11} stroke={1.6} />
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 160,
          }}
          title={file.name}
        >
          {file.name}
        </span>
        <span style={{ color: T.mute, fontFamily: FONT_MONO, fontSize: 10 }}>
          {file.size}
        </span>
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {(isPdf || isImage) && (
          <button
            type="button"
            onClick={openInTab}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 9999,
              background: T.canvas,
              border: `1px solid ${T.hairline}`,
              color: T.charcoal,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <Icon name="fileText" size={10} stroke={1.6} /> View
          </button>
        )}
        <button
          type="button"
          onClick={sendToEncompass}
          disabled={pushState === 'pushing' || pushState === 'sent'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 9999,
            background: pushState === 'sent' ? T.surfaceSoft : T.ink,
            border: 0,
            color: pushState === 'sent' ? T.charcoal : T.canvas,
            fontSize: 11,
            cursor: pushState === 'pushing' || pushState === 'sent' ? 'default' : 'pointer',
            opacity: pushState === 'pushing' ? 0.6 : 1,
          }}
        >
          {pushState === 'sent' ? (
            <>
              <Icon name="check" size={10} stroke={2.5} /> Sent
            </>
          ) : pushState === 'pushing' ? (
            <>
              <span className="qp-dot" /> Pushing
            </>
          ) : (
            <>
              <Icon name="arrowRight" size={10} stroke={1.8} /> Send to Encompass
            </>
          )}
        </button>
      </div>

      {/* Status message */}
      {pushMsg && (
        <div
          style={{
            fontSize: 11,
            color: pushState === 'error' ? T.down : T.body,
            fontFamily: FONT_MONO,
            textAlign: 'right',
            maxWidth: 320,
          }}
        >
          {pushMsg}
        </div>
      )}
    </div>
  );
}

function b64ToBlob(b64: string, mimeType: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

/* ---------- User message ---------- */
interface UserMessageProps {
  text: string;
  attachments?: AttachedFile[];
}

function UserMessage({ text, attachments }: UserMessageProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginBottom: 32,
        gap: 10,
      }}
    >
      {attachments && attachments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end' }}>
          {attachments.map((a, i) => (
            <AttachmentPreview key={i} file={a} />
          ))}
        </div>
      )}
      <div style={{ maxWidth: '80%' }}>
        <div
          style={{
            padding: '10px 18px',
            borderRadius: 9999,
            background: T.surfaceSoft,
            color: T.ink,
            fontSize: 15,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            fontFamily: FONT_BODY,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

/* ---------- Message actions ---------- */
function MessageActions({ onCopy, content }: { onCopy: () => void; content: string }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const acts: { icon: IconName; title: string; onClick?: () => void }[] = [
    {
      icon: copied ? 'check' : 'copy',
      title: copied ? 'Copied' : 'Copy',
      onClick: () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
    },
    {
      icon: shared ? 'check' : 'share',
      title: shared ? 'Link copied' : 'Share',
      onClick: async () => {
        const url = window.location.href;
        const shareText = `${content}\n\n— Quinn AI Deal Desk · ${url}`;
        try {
          if (navigator.share) {
            await navigator.share({ title: 'Quinn — Deal Desk Answer', text: content, url });
          } else {
            await navigator.clipboard.writeText(shareText);
          }
          setShared(true);
          setTimeout(() => setShared(false), 1500);
        } catch {
          // user cancelled share or clipboard blocked — silent
        }
      },
    },
    { icon: 'refresh', title: 'Retry' },
  ];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        marginTop: 14,
        marginLeft: -8,
      }}
    >
      {acts.map((b, i) => (
        <button
          key={i}
          type="button"
          onClick={b.onClick}
          title={b.title}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.surfaceSoft;
            e.currentTarget.style.color = T.ink;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = T.body;
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: 9999,
            background: 'transparent',
            border: 0,
            color: T.body,
            transition: 'all .15s',
            cursor: 'pointer',
          }}
        >
          <Icon name={b.icon} size={14} stroke={1.6} />
        </button>
      ))}
    </div>
  );
}

/* ---------- Assistant message ---------- */
interface AssistantMessageProps {
  msg: Message & { tools?: ToolStepData[] };
  streaming: boolean;
}

function AssistantMessage({ msg, streaming }: AssistantMessageProps) {
  const html = useMemo(() => renderMarkdown(msg.content || ''), [msg.content]);
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 36 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9999,
          background: T.canvas,
          border: `1px solid ${T.hairlineStrong}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <QuinnMark size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: T.ink,
              fontFamily: FONT_DISPLAY,
            }}
          >
            Quinn
          </span>
          <span style={{ fontSize: 12, color: T.mute, fontFamily: FONT_MONO }}>
            ai-deal-desk
          </span>
        </div>
        {msg.tools && msg.tools.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginBottom: 16,
            }}
          >
            {msg.tools.map((tt, i) => (
              <ToolStep key={i} {...tt} />
            ))}
          </div>
        )}
        <div
          className="qp-prose"
          dangerouslySetInnerHTML={{
            __html: html + (streaming ? '<span class="qp-cursor"></span>' : ''),
          }}
        />
        {msg.generativeUI && !streaming && (
          <div style={{ marginTop: 16 }}>
            <GenerativeUI ui={msg.generativeUI} />
          </div>
        )}
        {!streaming && msg.sources && msg.sources.length > 0 && (
          <Citations sources={msg.sources} />
        )}
        {!streaming && msg.content && (
          <MessageActions
            onCopy={() => navigator.clipboard?.writeText(msg.content)}
            content={msg.content}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Composer ---------- */
interface ComposerProps {
  onSend: (text: string, files: AttachedFile[]) => void;
  busy: boolean;
  onStop: () => void;
}

function Composer({ onSend, busy, onStop }: ComposerProps) {
  const [val, setVal] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [focused, setFocused] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 180) + 'px';
  }, [val]);

  const handleSend = (): void => {
    const text = val.trim();
    if ((!text && files.length === 0) || busy) return;
    onSend(text, files);
    setVal('');
    setFiles([]);
  };

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;
    const next: AttachedFile[] = [];
    for (const f of picked) {
      try {
        next.push(await fileToAttached(f));
      } catch {
        // skip files that fail to read
      }
    }
    if (next.length) setFiles((prev) => [...prev, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      style={{
        borderRadius: 24,
        background: T.canvas,
        border: `1px solid ${focused ? T.ink : T.hairlineStrong}`,
        padding: 14,
        transition: 'border-color .15s',
      }}
    >
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {files.map((f, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 14px 8px 10px',
                  borderRadius: 9999,
                  background: T.surfaceSoft,
                  border: `1px solid ${T.hairline}`,
                  maxWidth: 260,
                }}
              >
                <Icon name="fileText" size={13} stroke={1.6} />
                <span
                  style={{
                    fontSize: 13,
                    color: T.ink,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.name}
                </span>
                <span style={{ fontSize: 11, color: T.mute, fontFamily: FONT_MONO }}>
                  {f.size}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                aria-label={`Remove ${f.name}`}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: 9999,
                  background: T.ink,
                  border: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.canvas,
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <Icon name="x" size={9} stroke={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
      <textarea
        ref={taRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Let's get going..."
        rows={1}
        style={{
          width: '100%',
          resize: 'none',
          border: 0,
          outline: 0,
          background: 'transparent',
          color: T.ink,
          fontFamily: FONT_BODY,
          fontSize: 16,
          lineHeight: 1.5,
          padding: '8px 6px 6px',
          minHeight: 28,
          maxHeight: 180,
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 4,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={onPickFiles}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          title="Attach a file"
          aria-label="Attach a file"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 9999,
            background: 'transparent',
            border: 0,
            color: T.charcoal,
            cursor: 'pointer',
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.surfaceSoft;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Icon name="paperclip" size={16} stroke={1.75} />
        </button>
        <button
          type="button"
          title="Tools"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 14px',
            borderRadius: 9999,
            background: 'transparent',
            border: `1px solid ${T.hairline}`,
            color: T.charcoal,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: FONT_BODY,
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.surfaceSoft;
            e.currentTarget.style.color = T.ink;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = T.charcoal;
          }}
        >
          <Icon name="tool" size={13} stroke={1.6} /> Tools
        </button>
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 12,
            color: T.mute,
            marginRight: 4,
            fontFamily: FONT_MONO,
          }}
        >
          ↵
        </span>
        {busy ? (
          <button
            type="button"
            onClick={onStop}
            title="Stop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: T.ink,
              border: 0,
              color: T.canvas,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                background: T.canvas,
                borderRadius: 2,
              }}
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!val.trim() && files.length === 0}
            title="Send"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: val.trim() || files.length > 0 ? T.ink : T.surfaceSoft,
              border: 0,
              color: val.trim() || files.length > 0 ? T.canvas : T.mute,
              transition: 'all .15s',
              cursor: val.trim() || files.length > 0 ? 'pointer' : 'default',
            }}
          >
            <Icon name="arrowUp" size={15} stroke={2.25} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */
interface Starter {
  icon: IconName;
  title: string;
  prompt: string;
}

const STARTERS: Starter[] = [
  {
    icon: 'database',
    title: 'Pull a deal',
    prompt: "What's the status of the Hernandez file?",
  },
  {
    icon: 'calc',
    title: 'DSCR scenario',
    prompt:
      'Run a DSCR scenario: $425k purchase, $3,200 rent, $1,950 PITI, 740 FICO.',
  },
  {
    icon: 'book',
    title: 'Program eligibility',
    prompt: 'Can a Condotel work for a 2nd-home borrower with 25% down?',
  },
  {
    icon: 'fileText',
    title: 'Create a Quote',
    prompt: 'Draft a term sheet for a $580k DSCR purchase, 75% LTV, 740 FICO.',
  },
];

interface EmptyStateProps {
  onPrompt: (p: string) => void;
  isMobile?: boolean;
}

function EmptyState({ onPrompt: _onPrompt, isMobile = false }: EmptyStateProps) {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: isMobile ? '48px 20px 16px' : '120px 24px 32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: isMobile ? 52 : 64,
          height: isMobile ? 52 : 64,
          borderRadius: 9999,
          margin: '0 auto 20px',
          background: T.canvas,
          border: `1px solid ${T.hairline}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <QuinnMark size={isMobile ? 26 : 32} />
      </div>
      <h1
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: isMobile ? 28 : 44,
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          color: T.ink,
          margin: '0 0 12px',
        }}
      >
        Welcome to the Future of Lending
      </h1>
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: isMobile ? 14 : 16,
          lineHeight: 1.5,
          color: T.body,
          margin: '0 auto',
          maxWidth: 560,
        }}
      >
        Run deals. Price loans. Build quotes. Close faster. Powered by Quinn AI.
      </p>
    </div>
  );
}

/* ---------- Sidebar ---------- */
interface SidebarNavItem {
  icon: IconName;
  label: string;
  prompt?: string;
}

const NAV_ITEMS: SidebarNavItem[] = [
  { icon: 'calc', label: 'Price a Loan', prompt: "I'd like to price a loan." },
  { icon: 'database', label: 'My Loans', prompt: "Show me my loan pipeline." },
  { icon: 'fileText', label: 'Build Quote', prompt: "Help me build a quote." },
  { icon: 'book', label: 'Docs' },
  { icon: 'sparkle', label: 'Marketing' },
];

interface SidebarProps {
  onNew: () => void;
  expanded: boolean;
  onAction?: (prompt: string) => void;
}

function Sidebar({ onNew, expanded, onAction }: SidebarProps) {
  return (
    <aside
      style={{
        width: '100%',
        height: '100%',
        background: T.canvas,
        borderRight: `1px solid ${T.hairline}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Header — Workspace label */}
      <div
        style={{
          height: 60,
          padding: expanded ? '0 20px' : '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'flex-start' : 'center',
          borderBottom: `1px solid ${T.hairline}`,
        }}
      >
        {expanded ? (
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 16,
              fontWeight: 600,
              color: T.ink,
            }}
          >
            Workspace
          </div>
        ) : (
          <QuinnMark size={20} />
        )}
      </div>

      {/* + New Thread */}
      <div style={{ padding: expanded ? '14px 14px 6px' : '14px 8px 6px' }}>
        {expanded ? (
          <PillButton
            variant="primary"
            icon="plus"
            size="md"
            onClick={onNew}
            style={{ width: '100%' }}
          >
            New Thread
          </PillButton>
        ) : (
          <button
            type="button"
            onClick={onNew}
            title="New Thread"
            aria-label="New Thread"
            style={{
              width: '100%',
              height: 38,
              borderRadius: 9999,
              background: T.ink,
              color: T.canvas,
              border: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="plus" size={16} stroke={2} />
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: expanded ? '6px 14px 12px' : '6px 8px 12px' }}>
        {expanded ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 34,
              padding: '0 12px',
              borderRadius: 9999,
              background: T.surfaceSoft,
              color: T.body,
            }}
          >
            <Icon name="search" size={13} stroke={1.6} />
            <input
              placeholder="Search Threads"
              style={{
                flex: 1,
                border: 0,
                outline: 0,
                background: 'transparent',
                fontFamily: FONT_BODY,
                fontSize: 13,
                color: T.ink,
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            title="Search Threads"
            aria-label="Search Threads"
            style={{
              width: '100%',
              height: 34,
              borderRadius: 9999,
              background: T.surfaceSoft,
              border: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: T.body,
            }}
          >
            <Icon name="search" size={14} stroke={1.6} />
          </button>
        )}
      </div>

      {/* Workspace nav */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: expanded ? '8px 8px' : '8px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        className="qp-scroll"
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.label}
            aria-label={item.label}
            onClick={() => item.prompt && onAction?.(item.prompt)}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.surfaceSoft)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: expanded ? '8px 12px' : '0',
              height: expanded ? 'auto' : 38,
              minHeight: 36,
              justifyContent: expanded ? 'flex-start' : 'center',
              background: 'transparent',
              border: 0,
              borderRadius: 8,
              cursor: 'pointer',
              color: T.charcoal,
              fontFamily: FONT_BODY,
              fontSize: 13.5,
              transition: 'background .15s',
            }}
          >
            <Icon name={item.icon} size={15} stroke={1.6} />
            {expanded && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer: data trust + access pill */}
      <div
        style={{
          padding: expanded ? '12px 14px' : '12px 8px',
          borderTop: `1px solid ${T.hairline}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {expanded && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 9999,
              background: T.surfaceSoft,
              color: T.charcoal,
              fontSize: 11.5,
              fontFamily: FONT_BODY,
              alignSelf: 'flex-start',
            }}
          >
            <Icon name="lock" size={11} stroke={1.6} />
            Your data stays yours
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: expanded ? 'flex-start' : 'center',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 9999,
              background: T.surfaceSoft,
              color: T.charcoal,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${T.hairline}`,
              flexShrink: 0,
            }}
          >
            <Icon name="lock" size={11} stroke={1.6} />
          </div>
          {expanded && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: T.ink, fontWeight: 600, fontFamily: FONT_BODY }}>
                OPEN ACCESS
              </div>
              <div style={{ fontSize: 10.5, color: T.mute, fontFamily: FONT_MONO }}>v6</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ---------- Top bar ---------- */
interface TopBarProps {
  onToggleSidebar: () => void;
  sidebarExpanded: boolean;
  onLoginClick: () => void;
  isMobile?: boolean;
}

function TopBar({ onToggleSidebar, sidebarExpanded, onLoginClick, isMobile = false }: TopBarProps) {
  return (
    <div
      style={{
        height: isMobile ? 56 : 64,
        padding: isMobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 10 : 14,
        borderBottom: `1px solid ${T.hairline}`,
        background: T.canvas,
        flexShrink: 0,
      }}
    >
      {/* Expand/collapse sidebar toggle (always visible) */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        onMouseEnter={(e) => (e.currentTarget.style.background = T.surfaceSoft)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        style={{
          width: 36,
          height: 36,
          borderRadius: 9999,
          border: 0,
          background: 'transparent',
          color: T.ink,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="list" size={18} stroke={1.6} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <QuinnMark size={20} />
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: isMobile ? 16 : 18,
            fontWeight: 600,
            color: T.ink,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Quinn
        </div>
        {!isMobile && (
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 13,
              color: T.body,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            TQL AI Deal Desk
          </div>
        )}
      </div>
      <PillButton variant="primary" size="sm" onClick={onLoginClick}>
        Login
      </PillButton>
    </div>
  );
}

/* ---------- Tool plan from query ---------- */
function planTools(q: string): ToolStepData[] {
  const s = q.toLowerCase();
  const plan: ToolStepData[] = [];
  if (/deal|loan|borrower|file|pipeline|status|encompass|hernandez/.test(s)) {
    plan.push({
      tool: 'database',
      label: 'Querying loan pipeline',
      detail: 'encompass · live',
      status: 'running',
    });
  }
  if (
    /dscr|guideline|program|product|ltv|cash[- ]out|qualif|eligib|condotel|multi[- ]unit|self[- ]employed|airbnb|str|rental/.test(
      s,
    )
  ) {
    plan.push({
      tool: 'book',
      label: 'Searching guidelines',
      detail: 'tql.program-matrix.pdf',
      status: 'running',
    });
  }
  if (/rate|price|pricing|locked|spread|today|sheet/.test(s)) {
    plan.push({
      tool: 'chart',
      label: 'Pulling rate sheet',
      detail: 'rate-desk · live',
      status: 'running',
    });
  }
  if (/term sheet|pre[- ]?qual|letter|draft|generate|pdf|quote/.test(s)) {
    plan.push({
      tool: 'fileText',
      label: 'Drafting document',
      detail: 'ts-dscr-2026',
      status: 'running',
    });
  }
  if (plan.length === 0) {
    plan.push({
      tool: 'search',
      label: 'Reasoning',
      detail: 'quinn · gemini',
      status: 'running',
    });
  }
  return plan;
}

/* ---------- Conversation hook ---------- */
type ExtMessage = Message & { tools?: ToolStepData[]; attachments?: AttachedFile[] };

function useQuinnConversation() {
  const [messages, setMessages] = useState<ExtMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(false);

  const send = useCallback(
    async (text: string, attachments: AttachedFile[] = []): Promise<void> => {
      abortRef.current = false;
      const fileNote = attachments.length
        ? `\n\n[Attached: ${attachments.map((a) => a.name).join(', ')}]`
        : '';
      const userMsg: ExtMessage = {
        id: uuidv4(),
        role: 'user',
        content: (text || '(see attached file)') + fileNote,
        timestamp: new Date(),
        attachments,
      };
      const tools = attachments.length
        ? [
            {
              tool: 'fileText' as ToolName,
              label: 'Reading attachment',
              detail: attachments[0].mimeType,
              status: 'running' as ToolStatus,
            },
            ...planTools(text),
          ]
        : planTools(text);
      const placeholder: ExtMessage = {
        id: uuidv4(),
        role: 'model',
        content: '',
        timestamp: new Date(),
        tools: tools.map((t) => ({ ...t, status: 'running' })),
      };
      setMessages((prev) => [...prev, userMsg, placeholder]);
      setBusy(true);

      // Log the user turn to Supabase (fire-and-forget; never blocks the chat).
      const sessionId = getSessionId();
      void logChatTurn({
        session_id: sessionId,
        role: 'user',
        content: text || '(file only)',
        attachments: attachments.length
          ? attachments.map((a) => ({ name: a.name, mimeType: a.mimeType, size: a.size }))
          : undefined,
      });
      void logSearch({ session_id: sessionId, query: text });

      try {
        // Pass first file to the multimodal endpoint (OpenAI vision).
        // Multiple files: only first is sent for now (matches existing service signature).
        const fileData = attachments[0]
          ? { mimeType: attachments[0].mimeType, data: attachments[0].data }
          : undefined;
        const stream = generateContentStream([...messages, userMsg], fileData);
        let acc = '';
        let gen: GenerativeUIData | undefined;
        for await (const chunk of stream) {
          if (abortRef.current) break;
          if ('text' in chunk && chunk.text) {
            acc += chunk.text;
            setMessages((prev) => {
              const c = [...prev];
              const last = c[c.length - 1];
              c[c.length - 1] = { ...last, content: acc };
              return c;
            });
          }
          if ('generativeUI' in chunk && chunk.generativeUI) {
            gen = chunk.generativeUI;
          }
        }

        // Mark all tool steps done
        setMessages((prev) => {
          const c = [...prev];
          const last = c[c.length - 1];
          c[c.length - 1] = {
            ...last,
            content: acc || last.content,
            tools: (last.tools || []).map((t) => ({ ...t, status: 'done' })),
            generativeUI: gen,
          };
          return c;
        });

        // Log the assistant reply
        if (acc) {
          void logChatTurn({ session_id: sessionId, role: 'assistant', content: acc });
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Quinn ran into an error.';
        setMessages((prev) => {
          const c = [...prev];
          const last = c[c.length - 1];
          c[c.length - 1] = {
            ...last,
            content: `_${message}_`,
            isError: true,
            tools: (last.tools || []).map((t) => ({ ...t, status: 'done' })),
          };
          return c;
        });
      } finally {
        setBusy(false);
      }
    },
    [messages],
  );

  const stop = useCallback((): void => {
    abortRef.current = true;
    setBusy(false);
  }, []);

  const reset = useCallback((): void => {
    setMessages([]);
    setBusy(false);
    abortRef.current = false;
  }, []);

  return { messages, busy, send, stop, reset };
}

/* ---------- Quinn Paper App ---------- */
export default function QuinnPaperApp() {
  const isMobile = useIsMobile();
  const { messages, busy, send, stop, reset } = useQuinnConversation();
  // Sidebar has 3 states on desktop: collapsed (icons only), expanded (full nav).
  // On mobile it's the same but the panel slides off-screen entirely when collapsed.
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!isMobile);
  const [adminOpen, setAdminOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.hash === '#/admin';
  });
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastIdx = messages.length - 1;
  const lastIsAssistant = messages[lastIdx]?.role === 'model';

  // Auto-collapse sidebar when crossing from desktop → mobile, auto-open on the reverse.
  useEffect(() => {
    setSidebarOpen(!isMobile);
    if (isMobile) setSidebarExpanded(true); // mobile drawer always shows full labels
  }, [isMobile]);

  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages]);

  // Listen for #/admin hash to open admin panel
  useEffect(() => {
    const onHash = (): void => setAdminOpen(window.location.hash === '#/admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const closeSidebar = (): void => setSidebarOpen(false);
  const openSidebar = (): void => setSidebarOpen(true);

  const toggleSidebar = (): void => {
    if (isMobile) {
      // Mobile: toggle the drawer entirely
      setSidebarOpen((v) => !v);
    } else {
      // Desktop: toggle between icons-only and expanded
      setSidebarExpanded((v) => !v);
    }
  };

  const handleLoginClick = (): void => {
    window.location.hash = '#/admin';
    setAdminOpen(true);
  };

  const handleAdminClose = (): void => {
    if (window.location.hash === '#/admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setAdminOpen(false);
  };

  const handleSidebarAction = (prompt: string): void => {
    void send(prompt);
    if (isMobile) closeSidebar();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        html, body, #root { height: 100%; height: 100dvh; margin: 0; padding: 0; overflow: hidden; }
        body { -webkit-tap-highlight-color: transparent; overscroll-behavior-y: none; }
        .qp-prose { word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; }
        /* Auto-fading scrollbar — invisible until hover, never shows the persistent grey bar */
        .qp-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .qp-scroll::-webkit-scrollbar { width: 0; height: 0; background: transparent; }
        @media (hover: hover) {
          .qp-scroll:hover { scrollbar-width: thin; }
          .qp-scroll:hover::-webkit-scrollbar { width: 6px; height: 6px; }
          .qp-scroll:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 999px; }
        }
        .qp-cursor::after { content: "▍"; display: inline-block; margin-left: 2px; color: ${T.ink}; animation: qp-blink 1s steps(2) infinite; font-weight: 300; }
        @keyframes qp-blink { 50% { opacity: 0; } }
        .qp-dot { width: 4px; height: 4px; border-radius: 999px; background: ${T.ink}; animation: qp-pulse 1.2s ease-in-out infinite; display: inline-block; }
        @keyframes qp-pulse { 0%,100% { opacity: 0.3; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .qp-prose p { margin: 0 0 12px; font-size: 16px; line-height: 1.55; color: #171717; }
        .qp-prose p:last-child { margin-bottom: 0; }
        .qp-prose strong { color: ${T.ink}; font-weight: 600; }
        .qp-prose em { color: #171717; font-style: italic; }
        .qp-prose ul, .qp-prose ol { margin: 0 0 12px; padding-left: 22px; }
        .qp-prose li { margin-bottom: 4px; line-height: 1.55; color: #171717; font-size: 16px; }
        .qp-prose code { font-family: ${FONT_MONO}; font-size: 0.875em; padding: 2px 8px; background: ${T.surfaceSoft}; border-radius: 9999px; color: ${T.ink}; }
        .qp-prose h3, .qp-prose h4 { font-family: ${FONT_DISPLAY}; font-size: 18px; font-weight: 600; margin: 20px 0 8px; color: ${T.ink}; }
        .qp-prose table { width: 100%; border-collapse: collapse; margin: 12px 0 16px; font-size: 14px; border: 1px solid ${T.hairline}; border-radius: 12px; overflow: hidden; table-layout: fixed; word-wrap: break-word; }
        .qp-prose th, .qp-prose td { text-align: left; padding: 10px 14px; border-bottom: 1px solid ${T.hairline}; }
        .qp-prose th { font-size: 12px; font-weight: 500; color: ${T.body}; background: ${T.surfaceSoft}; text-transform: uppercase; letter-spacing: 0.04em; }
        .qp-prose td { color: ${T.ink}; font-variant-numeric: tabular-nums; }
        .qp-prose tr:last-child td { border-bottom: 0; }
        /* Mobile: prevent iOS zoom on focus, tighten margins, scale headline */
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          .qp-prose p, .qp-prose li { font-size: 15px; }
          .qp-prose h3, .qp-prose h4 { font-size: 17px; }
          input, textarea, select { font-size: 16px !important; }
        }
      `}</style>
      <div
        style={{
          width: '100vw',
          height: '100dvh',
          position: 'relative',
          display: 'flex',
          overflow: 'hidden',
          background: T.canvas,
          color: T.ink,
          fontFamily: FONT_BODY,
        }}
      >
        {/* Sidebar — overlay on mobile, collapsible-width (icon mode → expanded) on desktop */}
        <div
          style={{
            position: isMobile ? 'fixed' : 'relative',
            top: 0,
            left: 0,
            height: isMobile ? '100dvh' : 'auto',
            zIndex: isMobile ? 50 : 'auto',
            transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
            transition: 'transform .25s, width .25s',
            flexShrink: 0,
            // Desktop: 0 (hidden) → 56 (icons only) → 240 (expanded labels)
            // Mobile: 280 px overlay always shows expanded
            width: isMobile ? 280 : sidebarOpen ? (sidebarExpanded ? 240 : 56) : 0,
            maxWidth: '85vw',
            overflow: 'hidden',
            boxShadow: isMobile && sidebarOpen ? '0 0 24px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          <Sidebar
            onNew={reset}
            expanded={isMobile ? true : sidebarExpanded}
            onAction={handleSidebarAction}
          />
        </div>

        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={closeSidebar}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              zIndex: 40,
              animation: 'qp-blink 0s',
            }}
          />
        )}

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-left .25s',
            minWidth: 0,
            width: '100%',
            overflowX: 'hidden',
          }}
        >
          <TopBar
            onToggleSidebar={toggleSidebar}
            sidebarExpanded={!isMobile && sidebarExpanded}
            onLoginClick={handleLoginClick}
            isMobile={isMobile}
          />
          <div
            ref={scrollerRef}
            className="qp-scroll"
            style={{ flex: 1, overflowY: 'auto', background: T.canvas }}
          >
            {messages.length === 0 ? (
              <EmptyState onPrompt={(p) => void send(p)} isMobile={isMobile} />
            ) : (
              <div
                style={{
                  maxWidth: 760,
                  margin: '0 auto',
                  padding: isMobile ? '20px 16px 16px' : '32px 24px 24px',
                }}
              >
                {messages.map((m, i) =>
                  m.role === 'user' ? (
                    <UserMessage
                      key={m.id}
                      text={m.content}
                      attachments={(m as ExtMessage).attachments}
                    />
                  ) : (
                    <AssistantMessage
                      key={m.id}
                      msg={m}
                      streaming={i === lastIdx && busy && lastIsAssistant}
                    />
                  ),
                )}
              </div>
            )}
          </div>
          <div
            style={{
              padding: isMobile ? '8px 12px 16px' : '12px 24px 24px',
              background: T.canvas,
              flexShrink: 0,
              borderTop: `1px solid ${T.hairline}`,
            }}
          >
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <Composer
                onSend={(t, files) => void send(t, files)}
                busy={busy}
                onStop={stop}
              />
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 10,
                  fontSize: isMobile ? 11 : 12,
                  color: T.mute,
                  fontFamily: FONT_BODY,
                }}
              >
                Quinn AI can make mistakes. Verify with source docs.
                {!isMobile && ' Powered by Total Quality Lending.'}
              </div>
            </div>
          </div>
        </div>
      </div>
      {adminOpen && <AdminPanel onClose={handleAdminClose} />}
    </>
  );
}
