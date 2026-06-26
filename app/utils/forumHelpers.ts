export function forumTypePicto(type: string): string {
  const map: Record<string, string> = {
    question: '❓', share: '💬', request: '🙋', bug: '🐛', announcement: '📢',
  }
  return map[type] ?? '📝'
}

export function forumFormatDate(iso: string, lang: string): string {
  const months: Record<string, string[]> = {
    fr: ['jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'],
    es: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  }
  const d = new Date(iso)
  const m = months[lang] ?? months.en
  return `${d.getUTCDate()} ${m[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function forumRenderWithLinks(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
  return escaped.replace(
    /https?:\/\/[^\s<&]+/g,
    url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline hover:text-blue-700 break-all">${url}</a>`,
  )
}
