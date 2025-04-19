"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CostStructureForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Structure</CardTitle>
        <CardDescription>
          Define your product costs, margins, and duties
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cogs">Cost of Goods Sold (COGS)</Label>
          <Textarea
            id="cogs"
            placeholder="Enter COGS details: Product, Cost, Currency, Unit"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="margins">Target Margins</Label>
          <Textarea
            id="margins"
            placeholder="Enter margin targets: Product, Target %, Minimum %"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duties">Duty Rates</Label>
          <Textarea
            id="duties"
            placeholder="Enter duty rates: HS Code, Country, Rate %"
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Cost Structure</Button>
        </div>
      </CardContent>
    </Card>
  );
} 