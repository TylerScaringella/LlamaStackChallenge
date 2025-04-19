"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/FileUpload";
import { ProductCatalogForm } from "@/components/ProductCatalogForm";
import { SupplyChainForm } from "@/components/SupplyChainForm";
import { CostStructureForm } from "@/components/CostStructureForm";

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tariff Copilot</h1>
          <Button variant="outline">Settings</Button>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList>
            <TabsTrigger value="setup">Initial Setup</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Tariff Copilot</CardTitle>
                <CardDescription>
                  Let's get started by setting up your trade optimization workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProductCatalogForm />
                <SupplyChainForm />
                <CostStructureForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tariff Monitoring</CardTitle>
                  <CardDescription>Real-time alerts and summaries</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Tariff monitoring content */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Impact Modeling</CardTitle>
                  <CardDescription>Simulation and analysis tools</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Cost impact content */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Supply Chain Diversification</CardTitle>
                  <CardDescription>Alternative supplier suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Supply chain content */}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect your favorite tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Integration toggles will go here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
