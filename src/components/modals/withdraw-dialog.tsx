"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BtcIcon } from "../icons/btc-icon";
import { EthIcon } from "../icons/eth-icon";
import { UsdcIcon } from "../icons/usdc-icon";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

const assets = [
  { icon: BtcIcon, name: 'Bitcoin', symbol: 'BTC' },
  { icon: EthIcon, name: 'Ethereum', symbol: 'ETH' },
  { icon: UsdcIcon, name: 'USD Coin', symbol: 'USDC' },
];

export function WithdrawDialog() {
    const { toast } = useToast();

    const handleWithdraw = () => {
        toast({
        title: "Withdrawal Submitted",
        description: "Your withdrawal request has been submitted for processing.",
        variant: "default",
        });
    };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Download className="mr-2 h-4 w-4" /> Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Crypto</DialogTitle>
          <DialogDescription>
            Enter the details for your withdrawal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="asset" className="text-right">
              Asset
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map(asset => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                      <div className="flex items-center gap-2">
                        <asset.icon className="w-5 h-5" />
                        <span>{asset.name} ({asset.symbol})</span>
                      </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input
              id="address"
              placeholder="Enter withdrawal address"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleWithdraw}>
            Submit Withdrawal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
