
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRecentRestocks } from "@/hooks/useRecentRestocks";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw } from "lucide-react";

const RecentRestocks: React.FC = () => {
  const { data: restocks, isLoading } = useRecentRestocks();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCw className="h-5 w-5 text-inventory-blue mr-2" />
          Recent Restocks
        </CardTitle>
        <CardDescription>Latest inventory updates</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <p>Loading...</p>
          </div>
        ) : restocks && restocks.length > 0 ? (
          <div className="space-y-4">
            {restocks.map((restock) => (
              <div
                key={restock.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{restock.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(restock.date), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <span className="text-inventory-green">
                    +{restock.quantity} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center py-4">
            <p>No recent restocks.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentRestocks;
