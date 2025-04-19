"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  accept?: string;
  onFileSelect?: (file: File) => void;
}

export function FileUpload({ accept = ".csv", onFileSelect }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileSelect?.(selectedFile);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Upload File</Label>
      <div className="flex items-center space-x-2">
        <Input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="flex-1"
        />
        {file && (
          <Button variant="outline" onClick={() => setFile(null)}>
            Clear
          </Button>
        )}
      </div>
      {file && (
        <p className="text-sm text-muted-foreground">
          Selected file: {file.name}
        </p>
      )}
    </div>
  );
} 