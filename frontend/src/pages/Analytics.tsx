
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StockLevelChart from "@/components/StockLevelChart";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AnalyticsPage: React.FC = () => {
  const { data: productAnalytics, isLoading } = useProductAnalytics();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  
  const selectedProduct = productAnalytics?.find(
    (product) => product.id === selectedProductId
  );
  
  // Format the data for the chart
  const chartData = React.useMemo(() => {
    if (!selectedProduct) return [];
    
    return selectedProduct.trends.map((trend) => ({
      name: trend.date,
      stock: trend.stock,
    }));
  }, [selectedProduct]);
  
  // Calculate product inventory metrics
  const productMetrics = React.useMemo(() => {
    if (!productAnalytics) return [];
    
    return productAnalytics.map((product) => {
      // Calculate trend data
      const trends = product.trends;
      const stockValues = trends.map((t) => t.stock);
      const currentStock = product.currentStock;
      const minStock = Math.min(...stockValues);
      const maxStock = Math.max(...stockValues);
      
      // Calculate change
      const firstStock = trends[0]?.stock || 0;
      const change = currentStock - firstStock;
      const changePercentage = firstStock !== 0 
        ? ((change / firstStock) * 100).toFixed(1) 
        : "N/A";
        
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock,
        minStock,
        maxStock,
        change,
        changePercentage,
      };
    });
  }, [productAnalytics]);

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Inventory trends and stock analysis
        </p>
      </div>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Stock Trends</CardTitle>
            <CardDescription>
              View stock level changes over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label htmlFor="product-select" className="block mb-2 text-sm font-medium">
                Select Product
              </label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading products...
                    </SelectItem>
                  ) : productAnalytics && productAnalytics.length > 0 ? (
                    productAnalytics.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No products available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProductId ? (
              <div className="h-[300px]">
                <StockLevelChart 
                  data={chartData} 
                  title={`Stock Trends: ${selectedProduct?.name || ""}`} 
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-[300px] bg-muted/20 rounded-md">
                <p className="text-muted-foreground">
                  Select a product to view stock trends
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory Metrics</CardTitle>
          <CardDescription>
            Stock level statistics for all products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <p>Loading metrics...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead className="text-right">Max Stock</TableHead>
                  <TableHead className="text-right">30-Day Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productMetrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell>{metric.sku}</TableCell>
                    <TableCell className="text-right">{metric.currentStock}</TableCell>
                    <TableCell className="text-right">{metric.minStock}</TableCell>
                    <TableCell className="text-right">{metric.maxStock}</TableCell>
                    <TableCell className="text-right">
                      <span className={
                        metric.change > 0 
                          ? "text-inventory-green" 
                          : metric.change < 0 
                          ? "text-inventory-red" 
                          : ""
                      }>
                        {metric.change > 0 ? "+" : ""}
                        {metric.change} ({metric.changePercentage}%)
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
