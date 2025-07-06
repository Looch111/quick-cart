"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SwapView() {
  return (
    <main className="flex-1 space-y-6 p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Swap</CardTitle>
          <CardDescription>Swap functionality is being rebuilt to resolve a critical error.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try again shortly.</p>
        </CardContent>
      </Card>
    </main>
  );
}
