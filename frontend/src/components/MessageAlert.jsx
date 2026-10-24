export default function MessageAlert({ type = 'error', message }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isInfo = type === 'info';

  const styles = isSuccess
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : isInfo
    ? 'bg-blue-50 text-blue-800 border-blue-200'
    : 'bg-rose-50 text-rose-800 border-rose-200';

  return (
    <div
      role="alert"
      className={`p-3 text-sm rounded-lg border mb-4 ${styles}`}
    >
      {message}
    </div>
  );
}

