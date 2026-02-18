export default function SessionLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/50 border-t-indigo-400 animate-spin" />
        <p className="text-sm text-white/50">Connecting…</p>
      </div>
    </div>
  );
}
