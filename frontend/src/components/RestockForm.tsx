
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLowStockProducts } from "@/hooks/useLowStockProducts";
import { useRestock, RestockInput } from "@/hooks/useRestock";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  productId: z.string({
    required_error: "Please select a product",
  }),
  quantity: z.coerce
    .number()
    .positive({
      message: "Quantity must be positive",
    })
    .int({
      message: "Quantity must be a whole number",
    }),
});

const RestockForm: React.FC = () => {
  const { data: products, isLoading: isLoadingProducts } = useLowStockProducts();
  const { mutate: restock, isPending } = useRestock();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // Create a properly typed RestockInput object from the form values
    const restockData: RestockInput = {
      productId: values.productId,
      quantity: values.quantity
    };
    
    restock(restockData, {
      onSuccess: () => {
        toast({
          title: "Restock successful",
          description: "The product has been restocked successfully.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to restock product.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingProducts ? (
                    <SelectItem value="loading" disabled>
                      Loading products...
                    </SelectItem>
                  ) : products && products.length > 0 ? (
                    products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.stock}/{product.lowStockThreshold})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No products need restocking
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Select the product to restock</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormDescription>Number of units to add</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Processing..." : "Restock Product"}
        </Button>
      </form>
    </Form>
  );
};

export default RestockForm;
