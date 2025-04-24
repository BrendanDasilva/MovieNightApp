const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-5xl mt-28 mb-8 px-4 py-10 bg-white rounded shadow">
        <h2 className="text-3xl font-bold mb-4 text-center">Welcome back,</h2>
        <p className="text-center text-gray-700 text-lg mb-8">
          Here’s what you chose between last time…
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full aspect-[2/3] bg-gray-200 rounded-lg shadow-inner flex items-center justify-center text-gray-500 text-lg"
            >
              Poster {i} (placeholder)
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
