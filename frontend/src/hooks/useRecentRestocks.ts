
import { useQuery } from "@tanstack/react-query";
import { RestockLog } from "@/types";
import { mockRestockLogs } from "@/mockData";

// In a real app, this would fetch from your API
const fetchRecentRestocks = async (): Promise<RestockLog[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Sort by date in descending order
      const sortedLogs = [...mockRestockLogs].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      // Return the most recent 5 logs
      resolve(sortedLogs.slice(0, 5));
    }, 500);
  });
};

export function useRecentRestocks() {
  return useQuery({
    queryKey: ["recentRestocks"],
    queryFn: fetchRecentRestocks,
  });
}
