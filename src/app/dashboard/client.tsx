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

// In dashboard/client.tsx, add a new GraphQL query for products
const PRODUCTS_QUERY = gql`
  query GetProducts {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          description
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
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

// Add a new Products component
function ProductsList() {
  const { loading, error, data } = useQuery(PRODUCTS_QUERY);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  const products = data.products.edges;

  if (products.length === 0) {
    return <p>No products found in this store.</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(({ node }) => (
          <div
            key={node.id}
            className="border rounded-lg overflow-hidden bg-white shadow-md"
          >
            {node.images.edges.length > 0 && (
              <img
                src={node.images.edges[0].node.url}
                alt={node.images.edges[0].node.altText || node.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg">{node.title}</h3>
              <p className="text-gray-700 mt-1">
                {node.priceRangeV2.minVariantPrice.amount}{" "}
                {node.priceRangeV2.minVariantPrice.currencyCode}
              </p>
              {node.description && (
                <p className="text-gray-600 mt-2 text-sm truncate">
                  {node.description.substring(0, 100)}
                  {node.description.length > 100 ? "..." : ""}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
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
        <ProductsList />
      </div>
    </ApolloProvider>
  );
}
