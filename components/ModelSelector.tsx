'use client';

const MODELS = [
  { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', badge: 'default' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', badge: 'fast' },
  { id: 'anthropic/claude-opus-4-5', label: 'Claude Opus', badge: '' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', badge: '' },
];

interface Props {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-white/15 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-white/30 cursor-pointer"
      style={{ background: 'var(--bg-hover)', color: 'rgb(var(--fg))' }}
    >
      {MODELS.map(m => (
        <option key={m.id} value={m.id}>
          {m.label}{m.badge ? ` (${m.badge})` : ''}
        </option>
      ))}
    </select>
  );
}
