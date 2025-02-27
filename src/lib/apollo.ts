import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import type { Session } from "@shopify/shopify-api";

export function createApolloClient(session: Session) {
  // Use our local proxy endpoint instead of direct Shopify API access
  const httpLink = new HttpLink({
    uri: "/api/graphql", // Use our local proxy endpoint
    credentials: "same-origin", // Include cookies
  });

  // Add auth headers for our local proxy
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        shop: session.shop, // Include shop for logging
      },
    };
  });

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "network-only",
      },
    },
  });
}
