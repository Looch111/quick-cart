"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Create a user document and initial data in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        createdAt: new Date(),
        totalBalance: "326613.98", // Initial total balance
        nairaBalance: "50000", // Initial Naira balance
      });
      
      // Batch write initial assets and transactions
      const batch = writeBatch(db);
      
      const initialAssets = [
        { id: "BTC", name: "Bitcoin", balance: "2.543", value: "165342.78" },
        { id: "ETH", name: "Ethereum", balance: "42.81", value: "148871.20" },
        { id: "USDC", name: "USD Coin", balance: "10000.00", value: "10000.00" },
        { id: "#2345", name: "Cool Ape NFT", balance: "1", value: "2400.00" },
      ];

      initialAssets.forEach(asset => {
        const assetRef = doc(db, `users/${user.uid}/assets`, asset.id);
        batch.set(assetRef, asset);
      });

      const initialTransactions = [
        { type: "Deposit", status: "Completed", date: "2024-05-20", amount: "+0.5 BTC" },
        { type: "Withdrawal", status: "Pending", date: "2024-05-19", amount: "-10.2 ETH" },
      ];

      initialTransactions.forEach((tx, index) => {
        const txRef = doc(db, `users/${user.uid}/transactions`, `txn_${index + 1}`);
        batch.set(txRef, tx);
      });

      await batch.commit();

      router.push("/");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                     <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading} />
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                     <div className="relative">
                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading} />
                         <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                        >
                            {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign In
          </Link>
        </div>
    </>
  );
}
