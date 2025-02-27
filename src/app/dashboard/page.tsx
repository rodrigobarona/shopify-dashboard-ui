"use client";

import { useState, useEffect } from "react";
import {
  type ApolloClient,
  ApolloProvider,
  type NormalizedCacheObject,
} from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import { createApolloClient } from "@/lib/apollo";
import { Session } from "@shopify/shopify-api";

// Example GraphQL query
const SHOP_QUERY = gql`
  query {
    shop {
      name
      id
      email
      myshopifyDomain
    }
  }
`;

// Shop info component
function ShopInfo() {
  const { loading, error, data } = useQuery(SHOP_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { shop } = data;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Shop Details</h2>
      <p>
        <strong>Name:</strong> {shop.name}
      </p>
      <p>
        <strong>Domain:</strong> {shop.myshopifyDomain}
      </p>
      <p>
        <strong>Email:</strong> {shop.email}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] =
    useState<ApolloClient<NormalizedCacheObject> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Failed to fetch session");

        const sessionData = await response.json();
        const newSession = new Session(sessionData);
        setSession(newSession);

        const apolloClient = createApolloClient(newSession);
        setClient(apolloClient);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!session || !client) {
    return (
      <div className="flex justify-center items-center h-screen">
        Session not found. Please log in again.
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <ShopInfo />
      </div>
    </ApolloProvider>
  );
}
