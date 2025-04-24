const Navbar = ({ onLogout }) => (
  <nav className="w-full bg-blue-700 text-white py-4 shadow-md fixed top-0 left-0 z-10">
    <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">🎬 Movie Night App</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm opacity-75">Powered by Letterboxd + TMDB</span>
        <button className="text-sm underline hover:text-white">Account</button>
        <button
          onClick={onLogout}
          className="text-sm underline hover:text-white"
        >
          Logout
        </button>
      </div>
    </div>
  </nav>
);

export default Navbar;
