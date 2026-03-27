"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      className="w-full rounded-none font-bold uppercase tracking-widest text-xs border-2 border-[#111] dark:border-[#f5f4ef] hover:bg-[#ff3b00] hover:text-white dark:hover:bg-[#ff3b00] transition-colors"
    >
      Terminate
    </Button>
  );
}
