// Session related types
export type SessionParams = {
  id: string;
  shop: string;
  state: string;
  isOnline: boolean;
  scope: string;
  accessToken: string;
  [key: string]: unknown; // For any additional properties
};

// Shopify related types
export interface ShopifyImage {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: string;
  sku: string | null;
  availableForSale: boolean;
  inventoryQuantity: number;
}

export interface EdgeNode<T> {
  node: T;
}

// Add this interface near the top of your file, under the imports
export interface ProductNode {
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

// Product Node
export interface ProductNode {
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
