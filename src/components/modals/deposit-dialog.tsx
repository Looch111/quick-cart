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
import { Upload } from "lucide-react";

const assets = [
  { icon: BtcIcon, name: 'Bitcoin', symbol: 'BTC' },
  { icon: EthIcon, name: 'Ethereum', symbol: 'ETH' },
  { icon: UsdcIcon, name: 'USD Coin', symbol: 'USDC' },
];

export function DepositDialog() {
  const { toast } = useToast();

  const handleDeposit = () => {
    toast({
      title: "Deposit Initiated",
      description: "Your deposit is being processed and will reflect in your balance shortly.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Crypto</DialogTitle>
          <DialogDescription>
            Select an asset and generate a deposit address.
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
              defaultValue="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
              readOnly
              className="col-span-3"
            />
          </div>
           <p className="text-center text-sm text-muted-foreground pt-2">
            Only send BTC to this address. Sending any other asset will result in permanent loss.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleDeposit}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
