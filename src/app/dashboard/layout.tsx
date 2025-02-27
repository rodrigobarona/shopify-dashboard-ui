"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getSessionId } from "@/lib/shopify";
import { sessionStorage } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shopName, setShopName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadSession() {
      const shopCookie = document.cookie.match(/shopify_shop=([^;]+)/)?.[1];
      if (!shopCookie) {
        router.push("/login");
        return;
      }

      setShopName(shopCookie.split(".")[0]);

      // Get session
      const sessionId = getSessionId(shopCookie);
      const session = await sessionStorage.loadSession(sessionId);

      if (!session) {
        router.push(`/login?shop=${shopCookie}`);
        return;
      }

      setIsLoading(false);
    }

    loadSession();
  }, [router]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <SidebarProvider>
      <AppSidebar storeName={shopName} />
      <main className="flex-1 p-6 md:p-8 pt-6 ml-16 min-w-0 lg:ml-72">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <SidebarTrigger className="lg:hidden" />
          </div>
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
