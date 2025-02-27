import { gql } from "@apollo/client";

export const PRODUCT_DETAIL_QUERY = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      description
      descriptionHtml
      vendor
      productType
      tags
      status
      priceRangeV2 {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price
            sku
            availableForSale
            inventoryQuantity
          }
        }
      }
    }
  }
`;
