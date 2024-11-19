"use client";
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { DatabaseIcon, LucideLoader2, MoveUp, RefreshCcw } from "lucide-react";
import { useState } from "react";

type Props = {};

const VectorDBPage = ({}: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  return (
    <main className="flex flex-col items-center p-24">
      <Card>
        <CardHeader>
          <CardTitle>Engineering knowledge base</CardTitle>
          <CardDescription>Add new documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 grid gap-4 border rounded-lg p-6">
              <div className="gap-4 relative">
                <Button
                  className="absolute -right-4 -top-4"
                  variant={"ghost"}
                  size={"icon"}
                >
                  <RefreshCcw />
                </Button>
                <Label>Files:</Label>
                <Textarea
                  readOnly
                  className="min-h-24 resize-none border p-3 shadow-none disabled:cursor-default focus-visible:ring-0 text-sm text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Index Name</Label>
                  <Input
                    placeholder="index name"
                    disabled={isUploading}
                    className="disabled:cursor-default"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Namespace</Label>
                  <Input
                    placeholder="namespace"
                    disabled={isUploading}
                    className="disabled:cursor-default"
                  />
                </div>
              </div>
            </div>
            <Button
              variant={"outline"}
              className="w-full h-full"
              disabled={isUploading}
            >
              <span className="flex flex-row">
                <DatabaseIcon size={50} className="stroke-red-400" />
                <MoveUp className="stroke-red-400" />
              </span>
            </Button>
          </div>
          {isUploading && (
            <div className="mt-4">
              <Label>File Name:</Label>
              <div className="flex flex-row items-center gap-4">
                <Progress value={80} />
                <LucideLoader2 className="stroke-red-300 animate-spin" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default VectorDBPage;
