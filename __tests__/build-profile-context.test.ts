// Tests for buildProfileContext from app/api/generate/route.ts

function buildProfileContext(profile: Record<string, string>): string {
  const lines: string[] = []

  if (profile.who?.trim())
    lines.push(`- Qui il est : ${profile.who.trim()}`)
  if (profile.audience?.trim())
    lines.push(`- Audience cible : ${profile.audience.trim()}`)
  if (profile.style?.trim())
    lines.push(`- Style de communication : ${profile.style.trim()}`)
  if (profile.formality?.trim())
    lines.push(`- Niveau de formalité : ${profile.formality.trim()}`)
  if (profile.topics?.trim())
    lines.push(`- Sujets de prédilection : ${profile.topics.trim()}`)
  if (profile.avoid?.trim())
    lines.push(`- À ÉVITER absolument : ${profile.avoid.trim()}`)
  if (profile.goal?.trim())
    lines.push(`- Objectif LinkedIn : ${profile.goal.trim()}`)

  if (lines.length === 0) return ''

  return `PROFIL DE L'AUTEUR — tiens-en compte pour personnaliser le post :\n${lines.join('\n')}\n\n`
}

describe('buildProfileContext', () => {
  it('returns empty string for empty profile', () => {
    expect(buildProfileContext({})).toBe('')
  })

  it('returns empty string when all fields are whitespace', () => {
    expect(buildProfileContext({ who: '   ', audience: '\t' })).toBe('')
  })

  it('includes header when at least one field is set', () => {
    const result = buildProfileContext({ who: 'Développeur' })
    expect(result).toContain("PROFIL DE L'AUTEUR")
  })

  it('includes all non-empty fields', () => {
    const result = buildProfileContext({
      who: 'Fondateur',
      audience: 'Entrepreneurs',
      style: 'Inspirant',
    })
    expect(result).toContain('Fondateur')
    expect(result).toContain('Entrepreneurs')
    expect(result).toContain('Inspirant')
  })

  it('trims whitespace from field values', () => {
    const result = buildProfileContext({ who: '  Consultant  ' })
    expect(result).toContain('Consultant')
    expect(result).not.toContain('  Consultant  ')
  })

  it('skips fields that are empty strings', () => {
    const result = buildProfileContext({ who: 'Dev', audience: '', goal: 'Inspirer' })
    expect(result).not.toContain('Audience cible')
    expect(result).toContain('Objectif LinkedIn')
  })

  it('ends with double newline for prompt chaining', () => {
    const result = buildProfileContext({ who: 'Dev' })
    expect(result.endsWith('\n\n')).toBe(true)
  })
})
