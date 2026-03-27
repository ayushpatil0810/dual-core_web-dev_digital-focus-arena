"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rooms?code=${code.toUpperCase()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Room not found");
      }

      // We append displayName in searchParams so the room can extract it for socket.io
      router.push(`/room/${code.toUpperCase()}?name=${encodeURIComponent(name || "Anonymous")}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#111] dark:bg-[#0a0a0a] flex flex-col selection:bg-[#ff3b00] selection:text-[#f5f4ef] text-[#f5f4ef]">
      <div className="p-8">
        <Button variant="ghost" asChild className="hover:bg-transparent hover:text-[#ff3b00] font-bold uppercase tracking-widest pl-0">
          <Link href="/"><ArrowLeft className="mr-2" /> Abort</Link>
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl border-4 border-[#ff3b00] p-8 md:p-16 relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3b00] -translate-y-1/2 translate-x-1/2 blur-[80px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />

          <div className="mb-12 relative z-10">
            <h1 className="font-heading text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#ff3b00]">
              Infiltrate
            </h1>
            <p className="opacity-70 font-medium uppercase tracking-widest text-sm mt-4">Enter Target Coordinates</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6 relative z-10">
            
            {error && (
              <div className="bg-[#ff3b00] text-[#111] font-bold uppercase text-xs p-3 tracking-widest">
                ERR: {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="uppercase font-bold tracking-widest text-xs text-[#ff3b00]">Access Code</Label>
              <Input 
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-CHAR CODE" 
                maxLength={6}
                className="rounded-none border-2 border-[#f5f4ef]/20 focus-visible:ring-0 focus-visible:border-[#ff3b00] bg-transparent h-20 text-4xl font-black tracking-[0.2em] font-heading uppercase text-center placeholder:text-[#f5f4ef]/10"
              />
            </div>

            <div className="space-y-2">
              <Label className="uppercase font-bold tracking-widest text-xs text-[#ff3b00]">Operative ID (Alias)</Label>
              <Input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="GUEST-001" 
                className="rounded-none border-2 border-[#f5f4ef]/20 focus-visible:ring-0 focus-visible:border-[#ff3b00] bg-transparent h-14 text-xl font-bold uppercase placeholder:text-[#f5f4ef]/20"
              />
            </div>

            <Button 
              disabled={isLoading || code.length < 6 || !name}
              type="submit" 
              className="w-full rounded-none h-16 text-xl font-black uppercase tracking-wider bg-[#ff3b00] hover:bg-[#f5f4ef] hover:text-[#111] text-[#111] transition-all mt-8 disabled:opacity-50"
            >
              {isLoading ? "Connecting..." : "Breach"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
