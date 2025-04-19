"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function InvoiceUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [goodsInfo, setGoodsInfo] = useState({
    countryOfOrigin: "",
    goodsType: "",
    description: ""
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Upload</CardTitle>
        <CardDescription>
          Upload your invoice and provide information about the imported goods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="invoice">Upload Invoice (PDF)</Label>
            <Input
              id="invoice"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected file: {file.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryOfOrigin">Country of Origin</Label>
            <Select
              value={goodsInfo.countryOfOrigin}
              onValueChange={(value) => 
                setGoodsInfo(prev => ({ ...prev, countryOfOrigin: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CN">China</SelectItem>
                <SelectItem value="VN">Vietnam</SelectItem>
                <SelectItem value="ID">Indonesia</SelectItem>
                <SelectItem value="MY">Malaysia</SelectItem>
                <SelectItem value="TH">Thailand</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="MX">Mexico</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="JP">Japan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goodsType">Type of Goods</Label>
            <Select
              value={goodsInfo.goodsType}
              onValueChange={(value) => 
                setGoodsInfo(prev => ({ ...prev, goodsType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select goods type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="textiles">Textiles</SelectItem>
                <SelectItem value="machinery">Machinery</SelectItem>
                <SelectItem value="chemicals">Chemicals</SelectItem>
                <SelectItem value="food">Food Products</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="automotive">Automotive Parts</SelectItem>
                <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Description</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the goods (optional)"
              value={goodsInfo.description}
              onChange={(e) => 
                setGoodsInfo(prev => ({ ...prev, description: e.target.value }))
              }
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button">Cancel</Button>
            <Button type="submit">Upload and Process</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 