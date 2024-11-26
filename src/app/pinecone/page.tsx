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

  const [indexName, setIndexName] = useState("");
  const [namespace, setNamespace] = useState("");

  const [filename, setFilename] = useState("");
  const [progress, setProgress] = useState(0);

  const onStartUpload = async () => {
    setProgress(0);
    setFilename("");
    setIsUploading(true);

    const response = await fetch("api/update-database", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        indexName,
        namespace,
      }),
    });

    if (!response.ok) {
      console.log("no response from call!");
    }

    await processStreamedProgress(response);
  };

  async function processStreamedProgress(response: Response) {
    console.log("Processing streamed progress"); // Add this
    const reader = response.body?.getReader();
    if (!reader) return;

    try {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsUploading(false);
          break;
        }

        buffer += new TextDecoder().decode(value);
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const update = JSON.parse(line);
              const { filename, totalChunks, chunksUpserted, isComplete } =
                update;

              if (totalChunks > 0) {
                const currentProgress = (chunksUpserted / totalChunks) * 100;
                setProgress(currentProgress);
                setFilename(`${filename} [${chunksUpserted}/${totalChunks}]`);
              }

              if (isComplete) {
                setIsUploading(false);
              }
            } catch (parseError) {
              console.error("Parsing error:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setIsUploading(false);
    } finally {
      reader.releaseLock();
    }
  }

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
                    value={indexName}
                    onChange={(e) => setIndexName(e.target.value)}
                    placeholder="index name"
                    disabled={isUploading}
                    className="disabled:cursor-default"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Namespace</Label>
                  <Input
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    placeholder="namespace"
                    disabled={isUploading}
                    className="disabled:cursor-default"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={onStartUpload}
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
              <Label>File Name: {filename}</Label>
              <div className="flex flex-row items-center gap-4">
                <Progress value={progress} />
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
