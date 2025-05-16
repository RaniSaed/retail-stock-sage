
import { useQuery } from "@tanstack/react-query";
import { ProductAnalytics } from "@/types";
import { mockProductAnalytics } from "@/mockData";

// In a real app, this would fetch from your API
const fetchProductAnalytics = async (): Promise<ProductAnalytics[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProductAnalytics);
    }, 500);
  });
};

const fetchProductAnalytic = async (id: string): Promise<ProductAnalytics | undefined> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const analytic = mockProductAnalytics.find((a) => a.id === id);
      resolve(analytic);
    }, 500);
  });
};

export function useProductAnalytics() {
  return useQuery({
    queryKey: ["productAnalytics"],
    queryFn: fetchProductAnalytics,
  });
}

export function useProductAnalytic(id: string) {
  return useQuery({
    queryKey: ["productAnalytic", id],
    queryFn: () => fetchProductAnalytic(id),
    enabled: !!id,
  });
}
