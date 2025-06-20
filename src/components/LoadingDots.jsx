// Animated loading indicator made of bouncing colored dots
const LoadingDots = () => (
  <div className="flex justify-center my-6">
    <div className="flex flex-row gap-2">
      {/* Orange dot */}
      <div className="w-4 h-4 rounded-full bg-purple-600 animate-bounce"></div>
      {/* Green dot with animation delay */}
      <div className="w-4 h-4 rounded-full bg-purple-600 animate-bounce [animation-delay:-.3s]"></div>
      {/* Blue dot with longer animation delay */}
      <div className="w-4 h-4 rounded-full bg-purple-600 animate-bounce [animation-delay:-.5s]"></div>
    </div>
  </div>
);

export default LoadingDots;
