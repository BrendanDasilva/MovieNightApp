const LoadingDots = () => (
  <div className="flex justify-center my-6">
    <div className="flex flex-row gap-2">
      <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce"></div>
      <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-.3s]"></div>
      <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-.5s]"></div>
    </div>
  </div>
);

export default LoadingDots;
