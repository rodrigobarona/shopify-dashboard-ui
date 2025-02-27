import { gql } from '@apollo/client';

export const STATS_QUERY = gql`
  query GetShopStats {
    shop {
      name
      myshopifyDomain
    }
    products(first: 1) {
      edges {
        cursor
      }
      pageInfo {
        totalCount
      }
    }
    orders(first: 1) {
      edges {
        cursor
      }
      pageInfo {
        totalCount
      }
    }
    customers(first: 1) {
      edges {
        cursor
      }
      pageInfo {
        totalCount
      }
    }
  }
`; 