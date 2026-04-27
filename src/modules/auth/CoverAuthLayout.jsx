import { Layers } from "lucide-react";

export function CoverAuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-orange-600 to-orange-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 border border-white/30 rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white/20 rotate-45" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm mb-6">
            <Layers className="w-12 h-12" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight uppercase mb-3">
            Admin Platform
          </h1>
          <p className="text-white/80 text-center text-sm tracking-widest uppercase">
            Powerful tools for modern administration
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
