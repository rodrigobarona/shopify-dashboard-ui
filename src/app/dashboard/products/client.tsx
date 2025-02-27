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
import {
  Card,
  Title,
  Text,
  Badge,
  Grid,
  TextInput,
  Button,
} from "@tremor/react";
import { Search, Plus } from "lucide-react";
import Image from "next/image";
import type { SessionParams } from "@/types";

// Define types
interface ProductNode {
  id: string;
  title: string;
  handle: string;
  description?: string;
  priceRangeV2: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
}

// Products query - modified to get more products
const PRODUCTS_QUERY = gql`
  query GetProducts($first: Int!) {
    products(first: $first) {
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Products List Component
function ProductsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { loading, error, data } = useQuery(PRODUCTS_QUERY, {
    variables: { first: 24 }, // Show more products on the dedicated page
  });

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  const products = data.products.edges;

  if (products.length === 0) {
    return <p>No products found in this store.</p>;
  }

  // Filter products based on search term
  const filteredProducts = products.filter(({ node }: { node: ProductNode }) =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-6">
        <div className="w-full max-w-md">
          <TextInput
            icon={Search}
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button icon={Plus} color="indigo">
          Add Product
        </Button>
      </div>

      {filteredProducts.length === 0 ? (
        <Text>No products matching your search</Text>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(({ node }: { node: ProductNode }) => (
            <Card key={node.id} className="flex flex-col h-full">
              {node.images.edges.length > 0 ? (
                <Image
                  src={node.images.edges[0].node.url}
                  alt={node.images.edges[0].node.altText || node.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  width={500}
                  height={300}
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-lg">
                  <Text>No image</Text>
                </div>
              )}
              <div className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                  <Title className="text-lg truncate">{node.title}</Title>
                  <Badge color="indigo">
                    {parseFloat(
                      node.priceRangeV2.minVariantPrice.amount
                    ).toFixed(2)}{" "}
                    {node.priceRangeV2.minVariantPrice.currencyCode}
                  </Badge>
                </div>
                {node.description && (
                  <Text className="mt-2 line-clamp-2">{node.description}</Text>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsClient({
  session,
  shop,
}: {
  session: SessionParams;
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
    });
    shopifySession.accessToken = session.accessToken;
    shopifySession.scope = session.scope;

    // Create Apollo client
    const apolloClient = createApolloClient(shopifySession);
    setClient(apolloClient);
  }, [session]);

  if (!client) return <p>Loading products...</p>;

  return (
    <ApolloProvider client={client}>
      <div>
        <Title className="text-2xl font-bold">Products</Title>
        <Text>Manage your {shop} products</Text>

        <Card className="mt-6">
          <ProductsList />
        </Card>
      </div>
    </ApolloProvider>
  );
}
