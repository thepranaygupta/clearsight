import type { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://docs.clearsight.pranaygupta.in'
const CONTENT_DIR = path.join(process.cwd(), 'content')

function walkMdx(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkMdx(full)
    if (entry.name.endsWith('.mdx')) return [full]
    return []
  })
}

function mdxPathToUrl(filePath: string): string {
  const relative = path.relative(CONTENT_DIR, filePath)
  const route = relative
    .replace(/\.mdx$/, '')
    .replace(/\/index$/, '')
    .replace(/^index$/, '')
  return route ? `${BASE_URL}/${route}` : BASE_URL
}

export default function sitemap(): MetadataRoute.Sitemap {
  const files = walkMdx(CONTENT_DIR)

  return files.map((file) => {
    const relative = path.relative(CONTENT_DIR, file)
    const isRoot = relative === 'index.mdx'
    const isSectionIndex = !isRoot && relative.endsWith('/index.mdx')

    return {
      url: mdxPathToUrl(file),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: isRoot ? 1 : isSectionIndex ? 0.8 : 0.6,
    }
  })
}
