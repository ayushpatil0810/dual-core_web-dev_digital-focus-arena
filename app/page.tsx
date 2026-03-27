import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#111] dark:bg-[#0a0a0a] dark:text-[#f5f4ef] selection:bg-[#ff3b00] selection:text-white flex flex-col justify-between">
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center border-b border-[#111]/10 dark:border-[#f5f4ef]/10">
        <div className="font-heading font-bold text-2xl tracking-tighter uppercase">
          Focus.Arena
        </div>
        <div className="flex items-center gap-6 font-medium text-sm">
          <Link href="/login" className="hover:text-[#ff3b00] transition-colors">
            Login
          </Link>
          <Link 
            href="/login" 
            className="bg-[#111] dark:bg-[#f5f4ef] text-[#f5f4ef] dark:text-[#111] px-6 py-3 rounded-none font-bold hover:bg-[#ff3b00] dark:hover:bg-[#ff3b00] hover:text-white transition-colors"
          >
            Start Session
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col md:flex-row">
        
        <div className="p-8 md:p-24 flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#111]/10 dark:border-[#f5f4ef]/10 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3b00] -translate-y-1/2 translate-x-1/2 blur-[120px] opacity-20 pointer-events-none rounded-full" />
          
          <h1 className="font-heading text-6xl md:text-8xl lg:text-[10rem] font-bold leading-[0.85] tracking-tight uppercase mb-8 md:mb-16 z-10">
            Work
            <br />
            <span className="text-[#ff3b00]">Zero</span>
            <br />
            Noise.
          </h1>

          <div className="max-w-md z-10">
            <p className="text-xl md:text-2xl font-light leading-relaxed mb-12">
              The digital arena for absolute focus. Shed the excess. Discard the distractions. Do the work that matters.
            </p>
            
            <Link 
              href="/login" 
              className="inline-flex items-center gap-4 bg-[#ff3b00] text-white px-8 py-5 text-lg font-bold uppercase tracking-wider hover:bg-[#111] dark:hover:bg-white dark:hover:text-[#111] transition-all group"
            >
              Enter Arena
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Sidebar structural area */}
        <div className="w-full md:w-[400px] flex flex-col">
          <div className="p-8 md:p-12 border-b border-[#111]/10 dark:border-[#f5f4ef]/10 flex-1">
            <h3 className="font-heading font-bold text-2xl uppercase mb-4">Methodology</h3>
            <p className="opacity-70 mb-8 leading-relaxed">
              We stripped away bento grids, glassmorphism, and meaningless gradients to leave you with a raw, brutal, and focused tool. 
            </p>
            <ul className="space-y-4 font-medium">
              <li className="flex gap-4 items-baseline">
                <span className="text-[#ff3b00] text-xl">01</span>
                <span>No passive scrolling.</span>
              </li>
              <li className="flex gap-4 items-baseline">
                <span className="text-[#ff3b00] text-xl">02</span>
                <span>Deep work only.</span>
              </li>
              <li className="flex gap-4 items-baseline">
                <span className="text-[#ff3b00] text-xl">03</span>
                <span>Pure output tracking.</span>
              </li>
            </ul>
          </div>
          <div className="p-8 md:p-12 flex-1 bg-[#111] dark:bg-[#0a0a0a] text-white border-t md:border-t-0 border-[#f5f4ef]/10">
            <h3 className="font-heading font-bold text-2xl uppercase mb-4 text-[#ff3b00]">Status</h3>
            <div className="space-y-6">
              <div>
                <div className="text-sm opacity-50 uppercase tracking-widest mb-1">Global Active</div>
                <div className="font-heading text-5xl font-bold">1,024</div>
              </div>
              <div>
                <div className="text-sm opacity-50 uppercase tracking-widest mb-1">Hours Logged</div>
                <div className="font-heading text-5xl font-bold text-[#ff3b00]">89.4k</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
