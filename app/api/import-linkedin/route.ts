import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// Parses LinkedIn data export CSV (Shares.csv)
// User downloads from: LinkedIn > Settings > Data Privacy > Get a copy of your data > Posts
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    const text = await file.text()
    const posts = parseLinkedInCSV(text)

    if (posts.length === 0) {
      return NextResponse.json({ error: 'Aucun post trouvé dans ce fichier. Assure-toi d\'uploader le fichier Shares.csv' }, { status: 400 })
    }

    return NextResponse.json({ posts: posts.slice(0, 5) }) // max 5 posts
  } catch {
    return NextResponse.json({ error: 'Erreur de parsing' }, { status: 500 })
  }
}

function parseLinkedInCSV(csv: string): string[] {
  const lines = csv.split('\n')
  const posts: string[] = []

  // LinkedIn Shares.csv format:
  // Date,ShareLink,ShareCommentary,ShareMediaCategory,ImageLink,LinkCaption,LinkDescription,LinkTitle,LinkUrl
  // Find header row
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
