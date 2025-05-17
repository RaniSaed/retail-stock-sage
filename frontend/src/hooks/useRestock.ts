import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { mockProducts, mockRestockLogs } from "@/mockData";

export interface RestockInput {
  productId: string;
  quantity: number;
}

// In a real app, this would call your API
const restockProduct = async ({ productId, quantity }: RestockInput) => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const productIndex = mockProducts.findIndex((p) => p.id === productId);
      
      if (productIndex === -1) {
        reject(new Error("Product not found"));
        return;
      }
      
      const product = mockProducts[productIndex];
      const previousStock = product.stock;
      const newStock = previousStock + quantity;
      
      // Update the product stock
      mockProducts[productIndex] = {
        ...product,
        stock: newStock,
        updatedAt: new Date().toISOString(),
      };
      
      // Create a restock log
      const restockLog = {
        id: uuidv4(),
        productId,
        productName: product.name,
        quantity,
        previousStock,
        newStock,
        date: new Date().toISOString(),
      };
      
      mockRestockLogs.push(restockLog);
      resolve(restockLog);
    }, 500);
  });
};

export function useRestock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: restockProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] });
      queryClient.invalidateQueries({ queryKey: ["recentRestocks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["productAnalytics"] });
    },
  });
}
