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
import { Upload, Loader2, Copy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getDepositAddress } from "@/app/actions/deposit-actions";
import Image from 'next/image';

const assets = [
  { icon: BtcIcon, name: 'Bitcoin', symbol: 'BTC' },
  { icon: EthIcon, name: 'Ethereum', symbol: 'ETH' },
  { icon: UsdcIcon, name: 'USD Coin', symbol: 'USDC' },
];

export function DepositDialog() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState(assets[0].symbol);
  const [isLoading, setIsLoading] = useState(false);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when the dialog is closed to ensure a fresh start next time
      setTimeout(() => {
        setDepositAddress(null);
        setIsLoading(false);
        setSelectedAssetSymbol(assets[0].symbol);
      }, 200);
    }
  };

  const handleGetAddress = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    const selectedAsset = assets.find(a => a.symbol === selectedAssetSymbol);
    if (!selectedAsset) return;

    setIsLoading(true);
    setDepositAddress(null);
    try {
      const result = await getDepositAddress({
        userId: user.uid,
        assetSymbol: selectedAsset.symbol,
      });

      if (result.success && result.address) {
        setDepositAddress(result.address);
      } else {
        toast({ title: "Error", description: result.message ?? "Failed to generate address.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress);
    toast({ title: "Copied!", description: "Deposit address copied to clipboard." });
  };

  const selectedAsset = assets.find(a => a.symbol === selectedAssetSymbol);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit {selectedAsset?.name}</DialogTitle>
          {!depositAddress ? (
            <DialogDescription>
              Select an asset to generate a deposit address.
            </DialogDescription>
          ) : (
            <DialogDescription className="text-destructive">
              Warning: Send ONLY {selectedAsset?.symbol} to this address. Sending any other asset will result in permanent loss.
            </DialogDescription>
          )}
        </DialogHeader>
        
        {depositAddress ? (
          <div className="space-y-4 pt-4 text-center">
            <div className="flex justify-center p-2 bg-white rounded-md">
              <Image 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${depositAddress}`} 
                width={150} height={150} 
                alt="Deposit QR Code" 
                data-ai-hint="qr code"
              />
            </div>
            <div className="relative">
              <p className="text-sm font-mono break-all bg-muted p-3 pr-10 rounded-md text-left">
                {depositAddress}
              </p>
              <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="asset" className="text-right">
                Asset
              </Label>
              <Select value={selectedAssetSymbol} onValueChange={setSelectedAssetSymbol} disabled={isLoading}>
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
          </div>
        )}

        <DialogFooter>
          {!depositAddress && (
            <Button type="button" onClick={handleGetAddress} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Generating...' : 'Get Deposit Address'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
