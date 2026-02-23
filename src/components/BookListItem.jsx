export default function BookListItem({ book }) {
  const title = book?.title || "Untitled"
  const authors = Array.isArray(book?.author_name) ? book.author_name.join(", ") : "Unknown author"
  const year = book?.first_publish_year ? `(${book.first_publish_year})` : ""
  const coverKey = book?.cover_edition_key
  const coverUrl = coverKey ? `https://covers.openlibrary.org/b/olid/${coverKey}-M.jpg` : null
  const link = book?.key ? `https://openlibrary.org${book.key}` : null

  return (
    <a
      className="flex gap-4 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 mt-3"
      href={link || "#"}
      target="_blank"
      rel="noreferrer"
    >
      <div className="h-16 w-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-gray-400">No cover</span>
        )}
      </div>

      <div className="min-w-0">
        <div className="font-semibold text-gray-900 truncate">
          {title} {year}
        </div>
        <div className="text-sm text-gray-600 truncate">{authors}</div>
      </div>
    </a>
  )
}