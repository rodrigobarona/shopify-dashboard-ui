"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Create a separate component that uses useSearchParams
function LoginForm() {
  const searchParams = useSearchParams();
  const [shop, setShop] = useState(searchParams.get("shop") || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    setIsLoading(true);

    try {
      // Redirect to auth endpoint
      window.location.href = `/api/auth?shop=${shop}`;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Shopify App Login</CardTitle>
        <CardDescription>
          Enter your Shopify store URL to continue
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="yourstorename.myshopify.com"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// Wrap the component that uses useSearchParams in Suspense
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
