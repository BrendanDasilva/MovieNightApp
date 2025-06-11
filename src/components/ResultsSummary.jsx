const ResultsSummary = ({ count }) => {
  if (count === 0) return null;
  return (
    <h3 className="text-lg font-medium text-center text-white">
      {count} movies found
    </h3>
  );
};

export default ResultsSummary;
