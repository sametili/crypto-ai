export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#0C0C0C] flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-[#F6465D] text-4xl font-bold mb-2 animate-pulse">
          1 error
        </div>
        <div className="text-white text-2xl font-bold bg-gradient-to-r from-[#02C076] via-[#FCD535] to-[#F6465D] text-transparent bg-clip-text animate-pulse">
          NOThing
        </div>
      </div>
    </div>
  );
} 