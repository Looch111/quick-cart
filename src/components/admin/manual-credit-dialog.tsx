"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { creditUserAccount } from "@/app/actions/deposit-actions";
import { Loader2 } from "lucide-react";
import { BtcIcon } from "../icons/btc-icon";
import { EthIcon } from "../icons/eth-icon";
import { UsdcIcon } from "../icons/usdc-icon";

const assetList = [
  { name: 'Bitcoin', symbol: 'BTC', icon: BtcIcon },
  { name: 'Ethereum', symbol: 'ETH', icon: EthIcon },
  { name: 'USD Coin', symbol: 'USDC', icon: UsdcIcon },
];

interface ManualCreditDialogProps {
  userId: string;
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualCreditDialog({ userId, userEmail, open, onOpenChange }: ManualCreditDialogProps) {
  const { toast } = useToast();
  const [assetSymbol, setAssetSymbol] = useState(assetList[0].symbol);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Error", description: "Please enter a valid positive amount.", variant: "destructive" });
      return;
    }

    const selectedAsset = assetList.find(a => a.symbol === assetSymbol);
    if (!selectedAsset) {
      toast({ title: "Error", description: "Please select a valid asset.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await creditUserAccount({
        userId,
        assetSymbol: selectedAsset.symbol,
        assetName: selectedAsset.name,
        amount: amountNum,
      });

      if (result.success) {
        toast({ title: "Success!", description: `Successfully credited ${amount} ${assetSymbol} to ${userEmail}.` });
        setAmount(""); // Reset form
        onOpenChange(false); // Close dialog
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Credit User Account</DialogTitle>
          <DialogDescription>
            Manually deposit assets into the wallet of <span className="font-semibold text-primary">{userEmail}</span>. This action is irreversible.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="asset" className="text-right">
              Asset
            </Label>
            <Select value={assetSymbol} onValueChange={setAssetSymbol} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                {assetList.map(asset => {
                  const Icon = asset.icon;
                  return (
                    <SelectItem key={asset.symbol} value={asset.symbol}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span>{asset.name} ({asset.symbol})</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 0.5"
              className="col-span-3"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Submit Credit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}