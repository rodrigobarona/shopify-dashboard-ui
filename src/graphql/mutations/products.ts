import { gql } from '@apollo/client';

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        description
      }
      userErrors {
        field
        message
      }
    }
  }
`; 