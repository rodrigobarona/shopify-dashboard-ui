import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import type { Session } from "@shopify/shopify-api";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
export function createApolloClient(session: Session) {
  const httpLink = new HttpLink({
    uri: `https://${session.shop}/admin/api/${LATEST_API_VERSION}/graphql.json`,
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        "X-Shopify-Access-Token": session.accessToken,
      },
    };
  });

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}
