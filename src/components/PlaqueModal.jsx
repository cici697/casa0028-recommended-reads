import { useEffect, useMemo, useState } from "react"

function cleanQuery(input) {
  return String(input ?? "")
    .replace(/\(.*?\)/g, " ")
    .replace(/\b\d{4}\b/g, " ")
    .replace(/[–—]/g, " ")
    .replace(/\bblue\s+plaque\b/gi, " ")
    .replace(/\bplaque\b/gi, " ")
    .replace(/\bcommemorates\b/gi, " ")
    .replace(/\blived\s+here\b/gi, " ")
    .replace(/\bworked\s+here\b/gi, " ")
    .replace(/\bwas\s+born\s+here\b/gi, " ")
    .replace(/\bdied\s+here\b/gi, " ")
    .replace(/\bdrank\s+here\b/gi, " ")
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u4e00-\u9fff\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function fetchOpenLibrary(query, mode = "q") {
  const base = "https://openlibrary.org/search.json"
  const param = mode === "author" ? "author" : mode === "title" ? "title" : "q"
  const url = `${base}?${param}=${encodeURIComponent(query)}&limit=8`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`OpenLibrary error: ${res.status}`)
  const data = await res.json()
  const docs = Array.isArray(data?.docs) ? data.docs : []

  return docs.slice(0, 8).map((d) => ({
    key: d.key,
    title: d.title,
    author: Array.isArray(d.author_name) ? d.author_name.join(", ") : "",
    year: d.first_publish_year ?? "",
    cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
    link: d.key ? `https://openlibrary.org${d.key}` : null,
  }))
}

export default function PlaqueModal({ isOpen, onClose, plaque }) {
  const [loading, setLoading] = useState(false)
  const [books, setBooks] = useState([])
  const [error, setError] = useState(null)

  const displayName =
    plaque?.personName ?? plaque?.title ?? plaque?.name ?? "Unknown"

  const query = useMemo(() => {
    const q =
      plaque?.olQuery ??
      plaque?.personName ??
      plaque?.title ??
      plaque?.name ??
      ""
    return cleanQuery(q)
  }, [plaque])

  useEffect(() => {
    if (!isOpen) return
    setBooks([])
    setError(null)
    if (!query) return

    let cancelled = false
    async function run() {
      try {
        setLoading(true)

        let result = await fetchOpenLibrary(query, "q")
        if (!result.length) result = await fetchOpenLibrary(query, "author")
        if (!result.length) result = await fetchOpenLibrary(query, "title")

        if (!result.length) {
          const tokens = query.split(" ").filter(Boolean)
          const shorter = tokens.slice(0, Math.min(tokens.length, 3)).join(" ")
          if (shorter && shorter !== query) {
            result = await fetchOpenLibrary(shorter, "q")
          }
        }

        if (!cancelled) setBooks(result)
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "Failed to fetch")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [isOpen, query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg">
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <div className="text-xl font-bold">
              Recommended Reading: {displayName}
            </div>
            <div className="text-sm text-gray-600 mt-1">Query: {query || "—"}</div>
          </div>

          <button
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="text-sm text-gray-700 mb-3">
            <span className="font-semibold">Sex:</span> {plaque?.sex ?? "unknown"}
            <span className="mx-2">•</span>
            <span className="font-semibold">Role:</span> {plaque?.role ?? "unknown"}
          </div>

          {loading && <div className="text-sm">Loading…</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !error && books.length === 0 && (
            <div className="text-sm">No results found.</div>
          )}

          {!loading && books.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {books.map((b) => (
                <a
                  key={b.key}
                  href={b.link ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {b.cover ? (
                      <img
                        src={b.cover}
                        alt={b.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold truncate">{b.title}</div>
                    <div className="text-sm text-gray-600 truncate">
                      {b.author || "Unknown author"}
                    </div>
                    <div className="text-sm text-gray-500">{b.year || ""}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}