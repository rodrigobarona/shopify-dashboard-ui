"use client";

import { useState, useEffect } from "react";
import {
  type ApolloClient,
  ApolloProvider,
  gql,
  type NormalizedCacheObject,
  useQuery,
} from "@apollo/client";
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

export default function DashboardClient({
  session,
  shop,
}: {
  session: ReturnType<Session["toObject"]>;
  shop: string;
}) {
  // Initialize Apollo client with session data
  const [client, setClient] =
    useState<ApolloClient<NormalizedCacheObject> | null>(null);

  useEffect(() => {
    // Reconstruct session object
    const shopifySession = new Session({
      id: session.id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      accessToken: session.accessToken,
      scope: session.scope,
    });

    // Create Apollo client
    const apolloClient = createApolloClient(shopifySession);
    setClient(apolloClient);
  }, [session]);

  if (!client) return <p>Loading dashboard...</p>;

  return (
    <ApolloProvider client={client}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="mb-4">Connected to {shop}</p>
        <ShopInfo />
      </div>
    </ApolloProvider>
  );
}
