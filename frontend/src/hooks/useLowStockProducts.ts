
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { mockProducts } from "@/mockData";

// In a real app, this would fetch from your API
const fetchLowStockProducts = async (): Promise<Product[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowStockProducts = mockProducts.filter(
        (product) => product.stock <= product.lowStockThreshold
      );
      resolve(lowStockProducts);
    }, 500);
  });
};

export function useLowStockProducts() {
  return useQuery({
    queryKey: ["lowStockProducts"],
    queryFn: fetchLowStockProducts,
  });
}
