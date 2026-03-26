export function formatHSCode(code: string): string {
  if (code.length === 2) return code; // Chapter
  if (code.length === 4) return `${code.slice(0, 2)}.${code.slice(2)}`; // Heading
  if (code.length === 6) return `${code.slice(0, 4)}.${code.slice(4)}`; // Subheading
  return code;
}

export function levelLabel(level: number): string {
  switch (level) {
    case 2: return 'Chapter';
    case 4: return 'Heading';
    case 6: return 'Subheading';
    default: return 'Code';
  }
}

export function cleanDescription(desc: string): string {
  return desc.replace(/;/g, ',').replace(/\s+/g, ' ').trim();
}
