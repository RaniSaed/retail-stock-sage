
import { useQuery } from "@tanstack/react-query";
import { DashboardSummary } from "@/types";
import { mockDashboardSummary } from "@/mockData";

// In a real app, this would fetch from your API
const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDashboardSummary);
    }, 500);
  });
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: fetchDashboardSummary,
  });
}
