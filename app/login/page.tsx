"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await authClient.signIn.email({
          email,
          password,
          fetchOptions: {
            onSuccess: () => {
              router.push("/dashboard");
            },
            onError: (ctx) => {
              alert(ctx.error.message);
            }
          }
        });
      } else {
        await authClient.signUp.email({
          email,
          password,
          name,
          fetchOptions: {
            onSuccess: () => {
              router.push("/dashboard");
            },
            onError: (ctx) => {
              alert(ctx.error.message);
            }
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGithubLogin() {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  }

  return (
    <div className="flex min-h-screen bg-[#ff3b00] text-[#111] selection:bg-[#111] selection:text-[#ff3b00] items-center justify-center p-4">
      
      <div className="w-full max-w-xl bg-[#f5f4ef] dark:bg-[#0a0a0a] border-4 border-[#111] p-8 md:p-16 relative shadow-[16px_16px_0_0_#111]">
        
        <div className="absolute top-0 right-0 p-4 font-heading font-black text-6xl opacity-10 uppercase select-none pointer-events-none">
          Auth
        </div>

        <div className="mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#111] dark:text-[#f5f4ef]">
            {isLogin ? "Return" : "Enlist"} <br/>
            to the Arena
          </h1>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6 relative z-10 w-full">
          {!isLogin && (
            <div className="space-y-2">
              <Label className="uppercase font-bold tracking-widest text-[#111]/70 dark:text-[#f5f4ef]/70 text-xs">Designation</Label>
              <Input 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name" 
                className="rounded-none border-2 border-[#111] dark:border-[#f5f4ef] focus-visible:ring-0 focus-visible:border-[#ff3b00] dark:focus-visible:border-[#ff3b00] bg-transparent h-14 text-lg font-medium placeholder:uppercase placeholder:text-sm placeholder:opacity-50"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="uppercase font-bold tracking-widest text-[#111]/70 dark:text-[#f5f4ef]/70 text-xs">Comms Link</Label>
            <Input 
              required 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="rounded-none border-2 border-[#111] dark:border-[#f5f4ef] focus-visible:ring-0 focus-visible:border-[#ff3b00] dark:focus-visible:border-[#ff3b00] bg-transparent h-14 text-lg font-medium placeholder:uppercase placeholder:text-sm placeholder:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label className="uppercase font-bold tracking-widest text-[#111]/70 dark:text-[#f5f4ef]/70 text-xs">Security Key</Label>
            <Input 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="rounded-none border-2 border-[#111] dark:border-[#f5f4ef] focus-visible:ring-0 focus-visible:border-[#ff3b00] dark:focus-visible:border-[#ff3b00] bg-transparent h-14 text-lg font-medium placeholder:uppercase placeholder:text-sm placeholder:opacity-50"
            />
          </div>

          <Button 
            disabled={isLoading} 
            type="submit" 
            className="w-full rounded-none h-16 font-bold uppercase tracking-wider text-xl bg-[#111] hover:bg-[#ff3b00] text-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#111] transition-colors"
          >
            {isLoading ? "Authenticating..." : (isLogin ? "Authenticate" : "Initialize Protocol")}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#111]/20 dark:border-[#f5f4ef]/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="bg-[#f5f4ef] dark:bg-[#0a0a0a] px-4 text-[#111]/50 dark:text-[#f5f4ef]/50">Or</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline"
            onClick={handleGithubLogin}
            className="w-full rounded-none h-16 font-bold uppercase tracking-wider text-lg border-2 border-[#111] dark:border-[#f5f4ef] hover:bg-[#111] hover:text-[#f5f4ef] dark:hover:bg-[#f5f4ef] dark:hover:text-[#111] bg-transparent text-[#111] dark:text-[#f5f4ef] transition-colors"
          >
            Continue with Github
          </Button>

          <div className="pt-4 text-center">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-sm font-bold uppercase tracking-widest hover:text-[#ff3b00] underline-offset-4 underline transition-colors"
            >
              {isLogin ? "Request Access (Sign Up)" : "Have Access? (Login)"}
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
