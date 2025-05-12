import React from "react";
import LoadingDots from "./LoadingDots";

const LatestNews = ({ articles, loading, error }) => {
  if (loading) return <LoadingDots />;
  if (error) return <div className="text-red-500">Error loading news</div>;

  return (
    <div className="space-y-6">
      {articles.map((article, index) => (
        <div key={index} className="border-l-4 border-blue-500 pl-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-sm text-gray-400 mb-1">
                {article.date} • {article.source}
              </div>
              <h3 className="text-lg font-medium mb-2">{article.title}</h3>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-2">{article.excerpt}</p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Read full article →
          </a>
        </div>
      ))}
    </div>
  );
};

export default LatestNews;
