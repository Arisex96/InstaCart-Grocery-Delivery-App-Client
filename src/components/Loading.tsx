const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3 p-8 animate-fade-in">
      <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-app-green animate-spin"></div>
      <p className="text-sm font-medium text-app-text-light animate-pulse-soft">
        Loading...
      </p>
    </div>
  );
};

export default Loading;
