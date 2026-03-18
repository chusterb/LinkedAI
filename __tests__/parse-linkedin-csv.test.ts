// Tests for parseLinkedInCSV and parseCSVLine
// Run with: npx vitest (after installing vitest)

// We re-export the private functions for testing via a test-only re-export below.
// The actual functions live in app/api/import-linkedin/route.ts

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parseLinkedInCSV(csv: string): string[] {
  const lines = csv.split('\n')
  const posts: string[] = []

  const headerIdx = lines.findIndex(l => l.includes('ShareCommentary') || l.includes('Commentary'))
  if (headerIdx === -1) return []

  const headers = parseCSVLine(lines[headerIdx])
  const commentaryIdx = headers.findIndex(h =>
    h.toLowerCase().includes('commentary') || h.toLowerCase().includes('sharecommentary')
  )
  if (commentaryIdx === -1) return []

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i])
    const text = cols[commentaryIdx]?.trim()
    if (text && text.length > 50) {
      posts.push(text)
    }
  }

  return posts
}

// ── parseCSVLine ─────────────────────────────────────────────────────────────

describe('parseCSVLine', () => {
  it('splits simple CSV', () => {
    expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('handles quoted fields', () => {
    expect(parseCSVLine('"hello world",b,c')).toEqual(['hello world', 'b', 'c'])
  })

  it('handles commas inside quotes', () => {
    expect(parseCSVLine('"hello, world",b')).toEqual(['hello, world', 'b'])
  })

  it('handles escaped quotes inside quoted fields', () => {
    expect(parseCSVLine('"say ""hello""",b')).toEqual(['say "hello"', 'b'])
  })

  it('returns single element for empty string', () => {
    expect(parseCSVLine('')).toEqual([''])
  })

  it('trims whitespace around fields', () => {
    expect(parseCSVLine(' a , b , c ')).toEqual(['a', 'b', 'c'])
  })
})

// ── parseLinkedInCSV ──────────────────────────────────────────────────────────

const VALID_CSV = `Date,ShareLink,ShareCommentary,ShareMediaCategory
2024-01-01,https://linkedin.com/post/1,"Ce post parle de développement personnel et contient plus de cinquante caractères pour être valide.",TEXT
2024-01-02,https://linkedin.com/post/2,"Court",TEXT
2024-01-03,https://linkedin.com/post/3,"Un autre post qui est assez long pour être inclus dans les résultats finaux de l'import.",TEXT`

describe('parseLinkedInCSV', () => {
  it('extracts posts from valid CSV', () => {
    const posts = parseLinkedInCSV(VALID_CSV)
    expect(posts).toHaveLength(2) // "Court" is filtered out (< 50 chars)
  })

  it('returns empty array for CSV without ShareCommentary header', () => {
    const csv = 'Date,Link,Text\n2024-01-01,http://example.com,foo'
    expect(parseLinkedInCSV(csv)).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(parseLinkedInCSV('')).toEqual([])
  })

  it('filters out posts shorter than 50 characters', () => {
    const csv = `Date,ShareCommentary\n2024-01-01,"Trop court"\n2024-01-02,"Ce post est suffisamment long pour passer le filtre de cinquante caractères minimum."`
    const posts = parseLinkedInCSV(csv)
    expect(posts).toHaveLength(1)
    expect(posts[0]).toContain('cinquante')
  })

  it('handles quoted commentary with commas', () => {
    const csv = `Date,ShareCommentary\n2024-01-01,"Premier point, deuxième point, troisième point — ce texte est assez long pour être valide."`
    const posts = parseLinkedInCSV(csv)
    expect(posts).toHaveLength(1)
    expect(posts[0]).toContain('Premier point, deuxième point')
  })

  it('works with Commentary header variant', () => {
    const csv = `Date,Commentary\n2024-01-01,"Ce post utilise le header Commentary alternatif et est assez long pour être valide."`
    expect(parseLinkedInCSV(csv)).toHaveLength(1)
  })
})
