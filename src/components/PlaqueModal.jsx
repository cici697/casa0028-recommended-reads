import { useEffect, useState } from "react"
import BookListItem from "./BookListItem"

export default function PlaqueModal({ setIsModalOpen, selectedPlaque }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const author = selectedPlaque?.properties?.lead_subject_name || ""

  useEffect(() => {
    if (!author) {
      setBooks([])
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchBooks() {
      setLoading(true)
      setError(null)
      setBooks([])

      try {
        const q = encodeURIComponent(author)
        const url = `https://openlibrary.org/search.json?author=${q}&limit=8&fields=key,title,author_name,first_publish_year,cover_edition_key`
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`OpenLibrary error: ${res.status}`)
        const data = await res.json()
        setBooks(Array.isArray(data.docs) ? data.docs : [])
      } catch (e) {
        if (e.name !== "AbortError") setError(String(e.message || e))
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
    return () => controller.abort()
  }, [author])

  return (
    <div className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Recommended Reading: {author || "Unknown"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {(selectedPlaque?.properties?.inscription || "").slice(0, 160)}
            </p>
          </div>

          <button
            type="button"
            className="-me-3 -mt-3 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Close"
            onClick={() => setIsModalOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="mt-4">
          {loading ? <p>Loading recommended reading…</p> : null}
          {error ? <p className="text-red-600">Failed to load: {error}</p> : null}
          {!loading && !error && books.length === 0 ? <p>No results found.</p> : null}

          {!loading && !error
            ? books.map((book, idx) => (
                <BookListItem
                  key={book.cover_edition_key || book.key || `${author}-${idx}`}
                  book={book}
                />
              ))
            : null}
        </div>
      </div>
    </div>
  )
}