"use client";

import { useState } from "react";
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
import { Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { depositCrypto } from "@/app/actions/deposit-actions";

const assets = [
  { icon: BtcIcon, name: 'Bitcoin', symbol: 'BTC' },
  { icon: EthIcon, name: 'Ethereum', symbol: 'ETH' },
  { icon: UsdcIcon, name: 'USD Coin', symbol: 'USDC' },
];

export function DepositDialog() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState(assets[0].symbol);
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDeposit = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    const depositAmount = parseFloat(amount);
    const selectedAsset = assets.find(a => a.symbol === selectedAssetSymbol);

    if (!selectedAsset || isNaN(depositAmount) || depositAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }

    setIsDepositing(true);
    try {
      const result = await depositCrypto({
        userId: user.uid,
        assetSymbol: selectedAsset.symbol,
        assetName: selectedAsset.name,
        amount: depositAmount,
      });

      if (result.success) {
        toast({ title: "Success", description: result.message });
        setAmount('');
        setOpen(false);
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Crypto</DialogTitle>
          <DialogDescription>
            Select an asset and amount to deposit into your wallet. This is a simulation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="asset" className="text-right">
              Asset
            </Label>
            <Select value={selectedAssetSymbol} onValueChange={setSelectedAssetSymbol} disabled={isDepositing}>
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
             <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
             <Input
              id="amount"
              type="number"
              placeholder="0.00"
              className="col-span-3"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isDepositing}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleDeposit} disabled={isDepositing}>
            {isDepositing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDepositing ? 'Depositing...' : 'Submit Deposit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
