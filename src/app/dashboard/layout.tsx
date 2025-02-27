"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shopName, setShopName] = useState<string>("");

  useEffect(() => {
    // Just get the shop name for the sidebar
    const shopCookie = document.cookie.match(/shopify_shop=([^;]+)/)?.[1];
    if (shopCookie) {
      setShopName(shopCookie.split(".")[0]);
    }
  }, []);

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
