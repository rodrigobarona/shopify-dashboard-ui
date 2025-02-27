"use client";

import { useState, useEffect } from "react";
import {
  type ApolloClient,
  ApolloProvider,
  type NormalizedCacheObject,
  useQuery,
} from "@apollo/client";
import { createApolloClient } from "@/lib/apollo";
import { Session } from "@shopify/shopify-api";
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Metric,
  AreaChart,
  type Color,
  Grid,
  Badge,
  BarChart,
} from "@tremor/react";
import { ShoppingBag, ShoppingCart, Users, TrendingUp } from "lucide-react";
import Image from "next/image";
import { STATS_QUERY, PRODUCTS_LIST_QUERY } from "@/graphql";
import type { ProductNode } from "@/types";

// Example sales data (replace with real data)
const salesData = [
  {
    date: "Jan 22",
    Sales: 2890,
    Orders: 35,
  },
  {
    date: "Feb 22",
    Sales: 1890,
    Orders: 25,
  },
  {
    date: "Mar 22",
    Sales: 3890,
    Orders: 55,
  },
  {
    date: "Apr 22",
    Sales: 4290,
    Orders: 85,
  },
  {
    date: "May 22",
    Sales: 3490,
    Orders: 54,
  },
  {
    date: "Jun 22",
    Sales: 6790,
    Orders: 120,
  },
];

// Stats Cards Component
function StatsCards() {
  const { loading, error, data } = useQuery(STATS_QUERY);

  if (loading) return <p>Loading stats...</p>;
  if (error) return <p>Error loading stats: {error.message}</p>;

  const { products, orders, customers } = data;

  return (
    <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
      <StatsCard
        title="Total Products"
        value={products.pageInfo.totalCount}
        icon={<ShoppingBag className="h-8 w-8" />}
        color="indigo"
      />
      <StatsCard
        title="Total Orders"
        value={orders.pageInfo.totalCount}
        icon={<ShoppingCart className="h-8 w-8" />}
        color="amber"
      />
      <StatsCard
        title="Total Customers"
        value={customers.pageInfo.totalCount}
        icon={<Users className="h-8 w-8" />}
        color="emerald"
      />
      <StatsCard
        title="Revenue"
        value="$43,350"
        icon={<TrendingUp className="h-8 w-8" />}
        color="rose"
      />
    </Grid>
  );
}

// Single Stats Card
function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: Color;
}) {
  return (
    <Card decoration="top" decorationColor={color}>
      <div className="flex items-center justify-between">
        <div>
          <Text>{title}</Text>
          <Metric>{value}</Metric>
        </div>
        <div className={`bg-${color}-100 p-3 rounded-full`}>{icon}</div>
      </div>
    </Card>
  );
}

// Products List Component
function ProductsList() {
  const { loading, error, data } = useQuery(PRODUCTS_LIST_QUERY);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  const products = data.products.edges;

  if (products.length === 0) {
    return <p>No products found in this store.</p>;
  }

  return (
    <div className="mt-6">
      <Card>
        <Title>Latest Products</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {products.map(({ node }: { node: ProductNode }) => (
            <Card key={node.id} className="flex flex-col">
              {node.images.edges.length > 0 && (
                <Image
                  src={node.images.edges[0].node.url}
                  alt={node.images.edges[0].node.altText || node.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  width={1920}
                  height={1080}
                />
              )}
              <div className="p-3 flex-grow">
                <div className="flex justify-between items-start">
                  <Title className="text-lg truncate">{node.title}</Title>
                  <Badge color="indigo">
                    {node.priceRangeV2.minVariantPrice.amount}{" "}
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
      </Card>
    </div>
  );
}

// Sales Charts Component
function SalesCharts() {
  return (
    <Grid numItemsMd={1} numItemsLg={2} className="gap-6 mt-6">
      <Card>
        <Title>Sales Overview</Title>
        <AreaChart
          className="mt-4 h-72"
          data={salesData}
          index="date"
          categories={["Sales"]}
          colors={["indigo"]}
          valueFormatter={(number) => `$${number.toLocaleString()}`}
        />
      </Card>
      <Card>
        <Title>Orders</Title>
        <BarChart
          className="mt-4 h-72"
          data={salesData}
          index="date"
          categories={["Orders"]}
          colors={["amber"]}
        />
      </Card>
    </Grid>
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
    });
    shopifySession.accessToken = session.accessToken;
    shopifySession.scope = session.scope;

    // Create Apollo client
    const apolloClient = createApolloClient(shopifySession);
    setClient(apolloClient);
  }, [session]);

  if (!client) return <p>Loading dashboard...</p>;

  return (
    <ApolloProvider client={client}>
      <div>
        <Title className="text-2xl font-bold">Dashboard</Title>
        <Text>Connected to {shop}</Text>

        <TabGroup className="mt-6">
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Products</Tab>
            <Tab>Orders</Tab>
            <Tab>Customers</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <StatsCards />
              <SalesCharts />
            </TabPanel>
            <TabPanel>
              <ProductsList />
            </TabPanel>
            <TabPanel>
              <Card className="mt-6">
                <Title>Orders</Title>
                <Text>Orders data will be displayed here</Text>
              </Card>
            </TabPanel>
            <TabPanel>
              <Card className="mt-6">
                <Title>Customers</Title>
                <Text>Customer data will be displayed here</Text>
              </Card>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </ApolloProvider>
  );
}
