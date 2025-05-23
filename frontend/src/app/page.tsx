"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, HelpCircle, Info } from "lucide-react";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:5001/api/parse-invoice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (Array.isArray(result.analysis)) {
        setAnalysisResults(result.analysis);
      } else {
        throw new Error("Invalid response format: 'analysis' not an array");
      }
    } catch (error) {
      console.error("Error processing invoice:", error);
      alert("Error processing invoice. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <p key={i} className="mb-2">
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-semibold text-blue-600">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    ));
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-background to-muted/20 min-h-screen">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Tariff Copilot
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowWelcome(true)}
            className="h-8 w-8 hover:bg-blue-500/10"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>

        {showWelcome ? (
          <div className="flex justify-center">
            <Card className="border-2 border-blue-500/20 bg-blue-950/10 w-full max-w-2xl shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    Welcome to Tariff Copilot! 👋
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowWelcome(false)}
                    className="h-8 w-8 hover:bg-blue-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-base">
                  Your AI-powered assistant for navigating international trade
                  tariffs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <h3 className="font-semibold">What is Tariff Copilot?</h3>
                  <p className="text-muted-foreground">
                    Tariff Copilot is an intelligent tool that helps businesses
                    understand and manage the impact of international trade
                    tariffs on their operations. By analyzing your invoices and
                    supply chain data, we provide actionable insights to
                    optimize your international trade strategy.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">How it works:</h3>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>Upload your invoice PDF</li>
                    <li>Get instant analysis of tariff implications</li>
                    <li>Receive recommendations for cost optimization</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowWelcome(false)}
                    className="w-full hover:bg-blue-500/10"
                  >
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-950/10 p-4 rounded-lg w-full border border-blue-500/10">
              <Info className="h-4 w-4 text-blue-400" />
              <p>
                Need help? Click the{" "}
                <HelpCircle className="h-4 w-4 inline text-blue-400" /> button
                above to learn more about how Tariff Copilot can help optimize
                your international trade operations.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center space-y-8">
          <div className="text-center space-y-2 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Invoice Processing
            </h2>
            <p className="text-muted-foreground">
              Upload your invoice and we'll help you analyze the tariff
              implications
            </p>
          </div>

          <Card className="w-full max-w-xl shadow-lg border-blue-500/10">
            <CardHeader>
              <CardTitle>Invoice Upload</CardTitle>
              <CardDescription>
                Upload your invoice PDF for processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="invoice">Invoice PDF</Label>
                  <Input
                    id="invoice"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer file:text-muted-foreground hover:border-blue-500/50 transition-colors"
                    required
                  />
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Upload and Process"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {analysisResults.length > 0 && (
            <div className="w-full max-w-4xl flex flex-col gap-6 mt-6">
              {analysisResults.map((item, index) => (
                <Card
                  key={index}
                  className="bg-muted/10 border border-blue-500/20 p-4 shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Item #{index + 1} Tariff Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {renderFormattedText(item)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
