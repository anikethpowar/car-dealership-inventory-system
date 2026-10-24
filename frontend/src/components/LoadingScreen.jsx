export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] flex flex-col items-center justify-center p-6"
    >
      <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <span className="text-slate-600 font-medium text-sm">{message}</span>
    </div>
  );
}

