import React from "react";
import LoadingDots from "./LoadingDots";

// Displays the latest movie-related news articles
const LatestNews = ({ articles, loading, error }) => {
  if (loading) return <LoadingDots />;
  if (error) return <div className="text-red-500">Error loading news</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article, index) => (
        <div
          key={index}
          className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 shadow"
        >
          {/* Optional image */}
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
          ) : (
            <div className="w-full h-48 bg-gray-800 rounded mb-4 flex items-center justify-center text-gray-500 text-sm italic">
              No image available
            </div>
          )}

          {/* Article metadata */}
          <div className="text-sm text-gray-400 mb-1">
            {article.date} • {article.source}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-4">{article.excerpt}</p>

          {/* Link */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Read full article →
          </a>
        </div>
      ))}
    </div>
  );
};

export default LatestNews;
