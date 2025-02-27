"use client";

import { useState, useEffect } from "react";
import {
  type ApolloClient,
  ApolloProvider,
  type NormalizedCacheObject,
  useQuery,
  useMutation,
} from "@apollo/client";
import { createApolloClient } from "@/lib/apollo";
import { Session } from "@shopify/shopify-api";
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Textarea,
  Grid,
} from "@tremor/react";
import { ArrowLeft, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type {
  SessionParams,
  ShopifyImage,
  ShopifyVariant,
  EdgeNode,
} from "@/types";
import { PRODUCTS_LIST_QUERY, UPDATE_PRODUCT_MUTATION } from "@/graphql";

// Product detail component
function ProductDetail({ productId }: { productId: string }) {
  const { loading, error, data } = useQuery(PRODUCTS_LIST_QUERY, {
    variables: { id: productId },
  });

  const [updateProduct, { loading: updating, error: updateError }] =
    useMutation(UPDATE_PRODUCT_MUTATION);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vendor, setVendor] = useState("");
  const [productType, setProductType] = useState("");
  const [tags, setTags] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize form state from fetched data
  useEffect(() => {
    if (data?.product) {
      setTitle(data.product.title);
      setDescription(data.product.description || "");
      setVendor(data.product.vendor || "");
      setProductType(data.product.productType || "");
      setTags(data.product.tags.join(", "));
    }
  }, [data]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateProduct({
        variables: {
          input: {
            id: productId,
            title,
            description,
            vendor,
            productType,
            tags: tags.split(",").map((tag) => tag.trim()),
          },
        },
      });

      if (result.data?.productUpdate?.userErrors?.length > 0) {
        console.error("Update errors:", result.data.productUpdate.userErrors);
      } else {
        setSuccessMessage("Product updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  if (loading) return <Text>Loading product details...</Text>;
  if (error) return <Text>Error loading product: {error.message}</Text>;

  const product = data.product;
  if (!product) return <Text>Product not found</Text>;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/products"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {updateError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error updating product: {updateError.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Grid numItemsMd={2} className="gap-6 mb-6">
          <Card>
            <Title className="mb-4">Basic Information</Title>
            <div className="space-y-4">
              <div>
                <Text className="mb-2">Product Title</Text>
                <TextInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Product name"
                  required
                />
              </div>

              <div>
                <Text className="mb-2">Description</Text>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description"
                  rows={5}
                />
              </div>
            </div>
          </Card>

          <Card>
            <Title className="mb-4">Product Images</Title>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.images.edges.map(({ node }: EdgeNode<ShopifyImage>) => (
                <div
                  key={node.id}
                  className="relative aspect-square overflow-hidden rounded-lg border"
                >
                  <Image
                    src={node.url}
                    alt={node.altText || "Product image"}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Grid>

        <Card className="mb-6">
          <Title className="mb-4">Classification</Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Text className="mb-2">Vendor</Text>
              <TextInput
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Vendor/Manufacturer"
              />
            </div>

            <div>
              <Text className="mb-2">Product Type</Text>
              <TextInput
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="Category"
              />
            </div>

            <div>
              <Text className="mb-2">Tags (comma separated)</Text>
              <TextInput
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="summer, sale, new"
              />
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <Title className="mb-4">Variants and Pricing</Title>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inventory
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {product.variants.edges.map(
                  ({ node }: EdgeNode<ShopifyVariant>) => (
                    <tr key={node.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {node.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {node.sku || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {node.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {node.inventoryQuantity}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          <Text className="mt-4 italic text-sm">
            Variant editing is not supported in this version
          </Text>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" icon={Save} loading={updating} color="indigo">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ProductDetailClient({
  session,
  shop,
  productId,
}: {
  session: SessionParams;
  shop: string;
  productId: string;
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

  if (!client) return <p>Loading product details...</p>;

  return (
    <ApolloProvider client={client}>
      <div>
        <Title className="text-2xl font-bold">Product Details</Title>
        <Text>Edit product information for {shop}</Text>

        <div className="mt-6">
          <ProductDetail productId={productId} />
        </div>
      </div>
    </ApolloProvider>
  );
}
