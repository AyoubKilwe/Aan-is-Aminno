// Tiny formatter for AI replies: **bold**, *italic*, bullets, line breaks. React escapes the text.
export default function Rich({ text }) {
  return text
    .split('\n')
    .map((l) => l.replace(/^\s*#+\s*/, '').replace(/^\s*[*-]\s+/, '• '))
    .filter((l, i, a) => l.trim() || (i > 0 && a[i - 1].trim()))
    .map((line, i) => (
      <p key={i}>
        {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) =>
          part.startsWith('**') ? <b key={j}>{part.slice(2, -2)}</b>
            : part.startsWith('*') && part.length > 2 && !part.startsWith('* ') ? <i key={j}>{part.slice(1, -1)}</i>
            : part,
        )}
      </p>
    ))
}
