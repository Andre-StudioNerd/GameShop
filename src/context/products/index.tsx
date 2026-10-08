/* eslint-disable react-refresh/only-export-components */

import { createContext, useEffect, useState } from "react";

import type { Product } from "../../types";

import { useFetch } from "../../hooks/useFetch";

export const ProductsContext = createContext<{
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
}>({
  products: [],
  selectedProduct: null,
  setSelectedProduct: () => {},
});

export const ProductsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, error, fetchData } = useFetch<{
    record: {
      products: Product[];
    };
  }>({
    url: "https://api.jsonbin.io/v3/b/6ac77ed0ac6210605a1f4c96/latest",
    method: "GET",
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data?.record?.products) {
      setProducts(data.record.products);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching products:", error);
    }
  }, [error]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        selectedProduct,
        setSelectedProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
