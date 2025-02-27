import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import type { Session } from "@shopify/shopify-api";

export function createApolloClient(session: Session) {
  // Error handling link
  const errorLink = onError(({ networkError, graphQLErrors }) => {
    if (networkError) {
      console.log(`Network error: ${networkError.message}`);
    }
    if (graphQLErrors) {
      for (const { message, locations, path } of graphQLErrors) {
        console.log(
          `GraphQL error: ${message}, Location: ${locations}, Path: ${path}`
        );
      }
    }
  });

  // Retry logic for network errors
  const retryLink = new RetryLink({
    delay: {
      initial: 300, // Initial delay in ms
      max: 3000, // Maximum delay
      jitter: true, // Randomize delay
    },
    attempts: {
      max: 3, // Maximum number of retries
      retryIf: (error) => !!error, // Retry if there's an error
    },
  });

  // HTTP link with Shopify headers
  const httpLink = new HttpLink({
    uri: "/api/graphql",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": session.accessToken || "",
    },
  });

  // Combine links with retry first, then error handling, then HTTP
  return new ApolloClient({
    link: from([retryLink, errorLink, httpLink]),
    cache: new InMemoryCache(),
  });
}
