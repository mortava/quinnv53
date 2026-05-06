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
  | 'thumbsUp'
  | 'thumbsDown'
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
  | 'trendDown';

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
    thumbsUp: (
      <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7V10l5-8a2 2 0 0 1 2 2v1.88z" />
    ),
    thumbsDown: (
      <path d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17v12l-5 8a2 2 0 0 1-2-2v-1.88z" />
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

/* ---------- User message ---------- */
function UserMessage({ text }: { text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginBottom: 32,
        gap: 8,
      }}
    >
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
function MessageActions({ onCopy }: { onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
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
    { icon: 'thumbsUp', title: 'Good' },
    { icon: 'thumbsDown', title: 'Bad' },
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
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Composer ---------- */
interface ComposerProps {
  onSend: (text: string) => void;
  busy: boolean;
  onStop: () => void;
}

function Composer({ onSend, busy, onStop }: ComposerProps) {
  const [val, setVal] = useState('');
  const [focused, setFocused] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 180) + 'px';
  }, [val]);

  const handleSend = (): void => {
    const text = val.trim();
    if (!text || busy) return;
    onSend(text);
    setVal('');
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
        placeholder="Ask Quinn anything"
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
            disabled={!val.trim()}
            title="Send"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: val.trim() ? T.ink : T.surfaceSoft,
              border: 0,
              color: val.trim() ? T.canvas : T.mute,
              transition: 'all .15s',
              cursor: val.trim() ? 'pointer' : 'default',
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

function EmptyState({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '64px 24px 32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 9999,
          margin: '0 auto 24px',
          background: T.canvas,
          border: `1px solid ${T.hairline}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <QuinnMark size={32} />
      </div>
      <h1
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1.11,
          color: T.ink,
          margin: '0 0 12px',
        }}
      >
        The deal desk that types back.
      </h1>
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: 16,
          lineHeight: 1.5,
          color: T.body,
          margin: '0 auto 48px',
          maxWidth: 520,
        }}
      >
        Run Scenarios, Access Pricing, Create Quotes, Access your Approved Files
        all without leaving this Workspace.
      </p>
      <div style={{ textAlign: 'left', maxWidth: 560, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 12,
            fontWeight: 500,
            color: T.mute,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 12,
            paddingLeft: 4,
          }}
        >
          Try one of these
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STARTERS.map((s, i) => (
            <button
              type="button"
              key={i}
              onClick={() => onPrompt(s.prompt)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.surfaceSoft;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 12,
                background: 'transparent',
                border: 0,
                borderBottom:
                  i < STARTERS.length - 1 ? `1px solid ${T.hairline}` : '0',
                textAlign: 'left',
                cursor: 'pointer',
                color: T.ink,
                transition: 'background .15s',
                fontFamily: FONT_BODY,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  background: T.surfaceSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.ink,
                  flexShrink: 0,
                }}
              >
                <Icon name={s.icon} size={13} stroke={1.6} />
              </div>
              <span
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: T.ink,
                  fontWeight: 500,
                }}
              >
                {s.title}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: T.body,
                  fontFamily: FONT_MONO,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 280,
                }}
              >
                {s.prompt}
              </span>
              <Icon name="arrowRight" size={14} stroke={1.6} style={{ color: T.mute }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sidebar ---------- */
interface SidebarProps {
  onNew: () => void;
  open: boolean;
  onClose: () => void;
}

function Sidebar({ onNew, open, onClose }: SidebarProps) {
  return (
    <aside
      style={{
        width: 264,
        background: T.canvas,
        borderRight: `1px solid ${T.hairline}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s',
      }}
    >
      <div
        style={{
          height: 64,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: `1px solid ${T.hairline}`,
        }}
      >
        <QuinnMark size={20} />
        <div
          style={{
            flex: 1,
            fontFamily: FONT_DISPLAY,
            fontSize: 17,
            fontWeight: 600,
            color: T.ink,
          }}
        >
          Quinn
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Hide"
          style={{
            width: 30,
            height: 30,
            borderRadius: 9999,
            background: 'transparent',
            border: 0,
            color: T.body,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.surfaceSoft;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Icon name="list" size={14} stroke={1.6} />
        </button>
      </div>
      <div style={{ padding: '16px 16px 8px' }}>
        <PillButton
          variant="primary"
          icon="plus"
          size="md"
          onClick={onNew}
          style={{ width: '100%' }}
        >
          New conversation
        </PillButton>
      </div>
      <div style={{ padding: '8px 16px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 36,
            padding: '0 14px',
            borderRadius: 9999,
            background: T.surfaceSoft,
            color: T.body,
          }}
        >
          <Icon name="search" size={13} stroke={1.6} />
          <input
            placeholder="Search threads"
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
      </div>
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}
        className="qp-scroll"
      >
        <div
          style={{
            padding: '32px 20px',
            textAlign: 'center',
            color: T.mute,
            fontFamily: FONT_BODY,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          No conversations yet.
          <br />
          Start one to see it here.
        </div>
      </div>
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${T.hairline}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9999,
            background: T.surfaceSoft,
            color: T.charcoal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${T.hairline}`,
          }}
        >
          <Icon name="lock" size={12} stroke={1.6} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              color: T.ink,
              fontWeight: 500,
              fontFamily: FONT_BODY,
            }}
          >
            OPEN ACCESS
          </div>
        </div>
        <button
          type="button"
          title="Settings"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.surfaceSoft;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 9999,
            border: 0,
            background: 'transparent',
            color: T.body,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="moreH" size={14} stroke={2} />
        </button>
      </div>
    </aside>
  );
}

/* ---------- Top bar ---------- */
interface TopBarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onNew: () => void;
}

function TopBar({ onToggleSidebar, sidebarOpen, onNew }: TopBarProps) {
  return (
    <div
      style={{
        height: 64,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderBottom: `1px solid ${T.hairline}`,
        background: T.canvas,
        flexShrink: 0,
      }}
    >
      {!sidebarOpen && (
        <button
          type="button"
          onClick={onToggleSidebar}
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
          }}
        >
          <Icon name="list" size={16} stroke={1.6} />
        </button>
      )}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 16,
            fontWeight: 500,
            color: T.ink,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          TQL AI Deal Desk
        </div>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 9999,
            background: T.surfaceSoft,
            color: T.charcoal,
            fontSize: 11.5,
            fontFamily: FONT_MONO,
          }}
        >
          v6
        </span>
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          borderRadius: 9999,
          background: T.surfaceSoft,
          color: T.charcoal,
          fontSize: 12,
          fontFamily: FONT_BODY,
        }}
      >
        <Icon name="lock" size={11} stroke={1.6} />
        Your data stays yours
      </div>
      <PillButton variant="secondary" icon="book" size="sm">
        Docs
      </PillButton>
      <PillButton variant="primary" icon="plus" size="sm" onClick={onNew}>
        New
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
type ExtMessage = Message & { tools?: ToolStepData[] };

function useQuinnConversation() {
  const [messages, setMessages] = useState<ExtMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(false);

  const send = useCallback(
    async (text: string): Promise<void> => {
      abortRef.current = false;
      const userMsg: ExtMessage = {
        id: uuidv4(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };
      const placeholder: ExtMessage = {
        id: uuidv4(),
        role: 'model',
        content: '',
        timestamp: new Date(),
        tools: planTools(text).map((t) => ({ ...t, status: 'running' })),
      };
      setMessages((prev) => [...prev, userMsg, placeholder]);
      setBusy(true);

      try {
        const stream = generateContentStream([...messages, userMsg]);
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
  const { messages, busy, send, stop, reset } = useQuinnConversation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastIdx = messages.length - 1;
  const lastIsAssistant = messages[lastIdx]?.role === 'model';

  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .qp-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .qp-scroll::-webkit-scrollbar-track { background: transparent; }
        .qp-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.10); border-radius: 999px; }
        .qp-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.20); }
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
        .qp-prose table { width: 100%; border-collapse: collapse; margin: 12px 0 16px; font-size: 14px; border: 1px solid ${T.hairline}; border-radius: 12px; overflow: hidden; }
        .qp-prose th, .qp-prose td { text-align: left; padding: 10px 14px; border-bottom: 1px solid ${T.hairline}; }
        .qp-prose th { font-size: 12px; font-weight: 500; color: ${T.body}; background: ${T.surfaceSoft}; text-transform: uppercase; letter-spacing: 0.04em; }
        .qp-prose td { color: ${T.ink}; font-variant-numeric: tabular-nums; }
        .qp-prose tr:last-child td { border-bottom: 0; }
      `}</style>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          overflow: 'hidden',
          background: T.canvas,
          color: T.ink,
          fontFamily: FONT_BODY,
        }}
      >
        <Sidebar
          onNew={reset}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            marginLeft: sidebarOpen ? 0 : -264,
            transition: 'margin-left .25s',
            minWidth: 0,
          }}
        >
          <TopBar
            onToggleSidebar={() => setSidebarOpen(true)}
            sidebarOpen={sidebarOpen}
            onNew={reset}
          />
          <div
            ref={scrollerRef}
            className="qp-scroll"
            style={{ flex: 1, overflowY: 'auto', background: T.canvas }}
          >
            {messages.length === 0 ? (
              <EmptyState onPrompt={(p) => void send(p)} />
            ) : (
              <div
                style={{
                  maxWidth: 760,
                  margin: '0 auto',
                  padding: '32px 24px 24px',
                }}
              >
                {messages.map((m, i) =>
                  m.role === 'user' ? (
                    <UserMessage key={m.id} text={m.content} />
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
              padding: '12px 24px 24px',
              background: `linear-gradient(180deg, transparent 0%, ${T.canvas} 30%)`,
              flexShrink: 0,
            }}
          >
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <Composer
                onSend={(t) => void send(t)}
                busy={busy}
                onStop={stop}
              />
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 10,
                  fontSize: 12,
                  color: T.mute,
                  fontFamily: FONT_BODY,
                }}
              >
                Quinn can make mistakes. Verify against source documents.
                Powered by Total Quality Lending
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
