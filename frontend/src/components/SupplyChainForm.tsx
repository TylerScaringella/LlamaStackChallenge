"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SupplyChainForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supply Chain Information</CardTitle>
        <CardDescription>
          Add your vendors, ports, and 3PL information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vendors">Vendors</Label>
          <Textarea
            id="vendors"
            placeholder="Enter vendor details: Name, Location, Contact, Products"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ports">Ports</Label>
          <Textarea
            id="ports"
            placeholder="Enter port details: Name, Country, Type (Air/Sea)"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="3pl">3PL Providers</Label>
          <Textarea
            id="3pl"
            placeholder="Enter 3PL details: Name, Services, Coverage"
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Supply Chain Info</Button>
        </div>
      </CardContent>
    </Card>
  );
} 