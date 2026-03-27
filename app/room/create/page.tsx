"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateRoomPage() {
  const router = useRouter();
  const [name, setName] = useState("Focus Sprint");
  const [duration, setDuration] = useState("25");
  const [maxMembers, setMaxMembers] = useState("4");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, duration: parseInt(duration), maxMembers: parseInt(maxMembers) }),
      });

      if (!res.ok) throw new Error("Failed to create room");

      const data = await res.json();
      router.push(`/room/${data.code}`);
    } catch (err) {
      console.error(err);
      alert("Error initializing room.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#ff3b00] flex flex-col selection:bg-[#111] selection:text-[#ff3b00] text-[#111]">
      <div className="p-8">
        <Button variant="ghost" asChild className="hover:bg-transparent hover:text-white font-bold uppercase tracking-widest pl-0">
          <Link href="/dashboard"><ArrowLeft className="mr-2" /> Back to Base</Link>
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#f5f4ef] dark:bg-[#0a0a0a] border-4 border-[#111] p-8 md:p-16 shadow-[16px_16px_0_0_#111] relative">
          
          <div className="mb-12">
            <h1 className="font-heading text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#111] dark:text-[#f5f4ef]">
              Initialize <br /> Protocol
            </h1>
            <p className="opacity-70 font-medium uppercase tracking-widest text-sm mt-4">Configure your focus arena</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-8">
            <div className="space-y-2">
              <Label className="uppercase font-bold tracking-widest text-xs opacity-70">Designation</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Session Name" 
                className="rounded-none border-2 border-[#111] dark:border-[#f5f4ef] focus-visible:ring-0 focus-visible:border-[#ff3b00] bg-transparent h-16 text-xl font-bold uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="uppercase font-bold tracking-widest text-xs opacity-70">Duration (Minutes)</Label>
                <div className="flex gap-2">
                  {[25, 50, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d.toString())}
                      className={`flex-1 h-14 border-2 border-[#111] dark:border-[#f5f4ef] font-bold text-lg transition-colors ${duration === d.toString() ? "bg-[#111] text-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#111]" : "hover:bg-[#ff3b00] hover:text-[#111] hover:border-[#ff3b00]"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="uppercase font-bold tracking-widest text-xs opacity-70">Capacity (Operatives)</Label>
                <div className="flex gap-2">
                  {[2, 4, 8].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMaxMembers(c.toString())}
                      className={`flex-1 h-14 border-2 border-[#111] dark:border-[#f5f4ef] font-bold text-lg transition-colors ${maxMembers === c.toString() ? "bg-[#111] text-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#111]" : "hover:bg-[#ff3b00] hover:text-[#111] hover:border-[#ff3b00]"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              disabled={isLoading}
              type="submit" 
              className="w-full rounded-none h-20 text-2xl font-black uppercase tracking-wider bg-[#111] text-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#111] hover:bg-[#ff3b00] dark:hover:bg-[#ff3b00] transition-colors mt-8"
            >
              {isLoading ? "Generating Link..." : "Create Arena"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
