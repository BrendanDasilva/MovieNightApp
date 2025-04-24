const Search = ({ username, setUsername, fetchWatchlist, toggleView }) => (
  <div className="flex justify-center gap-4">
    <input
      className="border border-gray-300 px-4 py-2 rounded w-64"
      placeholder="Enter Letterboxd username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
    <button
      onClick={fetchWatchlist}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Fetch
    </button>
    <button
      onClick={toggleView}
      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
    >
      Toggle View
    </button>
  </div>
);

export default Search;
