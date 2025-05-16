
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types";
import { mockProducts } from "@/mockData";
import { v4 as uuidv4 } from "uuid";

// In a real app, these would fetch from your API
const fetchProducts = async (): Promise<Product[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProducts);
    }, 500);
  });
};

const fetchProduct = async (id: string): Promise<Product | undefined> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = mockProducts.find((p) => p.id === id);
      resolve(product);
    }, 500);
  });
};

const createProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct: Product = {
        id: uuidv4(),
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProducts.push(newProduct);
      resolve(newProduct);
    }, 500);
  });
};

const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockProducts.findIndex((p) => p.id === id);
      if (index !== -1) {
        const updatedProduct = {
          ...mockProducts[index],
          ...productData,
          updatedAt: new Date().toISOString(),
        };
        mockProducts[index] = updatedProduct;
        resolve(updatedProduct);
      } else {
        reject(new Error("Product not found"));
      }
    }, 500);
  });
};

const deleteProduct = async (id: string): Promise<void> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockProducts.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockProducts.splice(index, 1);
        resolve();
      } else {
        reject(new Error("Product not found"));
      }
    }, 500);
  });
};

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id && id !== "new",
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}
