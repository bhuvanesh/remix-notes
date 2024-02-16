function NoteList({ notes }) {
  return (
    <div id="note-list" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl">
      {notes.map((note, index) => (
        <div key={note.id} className="note bg-white rounded-lg shadow-md p-4">
          <article>
            <header>
              <ul className="note-meta flex items-center justify-between">
                <li className="text-gray-500">#{index + 1}</li>
                {/* Removed date functionality here */}
              </ul>
              <h2 className="text-xl font-bold">{note.title}</h2>
            </header>
            <p className="text-gray-700">{note.content}</p>
          </article>
        </div>
      ))}
    </div>
  );
}


export default NoteList;