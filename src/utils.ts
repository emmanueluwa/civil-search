import { FeatureExtractionPipeline, pipeline, env } from "@xenova/transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";

// Skip local model check
env.allowLocalModels = false;

type DownloadProgress = {
  status: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
};

type ProgressCallback = (
  filename: string,
  totalChunks: number,
  chunksUpserted: number,
  isComplete: boolean
) => void;

export async function updateVectorDB(
  client: Pinecone,
  indexName: string,
  namespace: string,
  docs: Document[],
  progressCallback: (
    filename: string,
    totalChunks: number,
    chunksUpserted: number,
    isComplete: boolean
  ) => void
) {
  const modelname = "mixedbread-ai/mxbai-embed-large-v1";

  //track model download progress
  const onModelDownloadProgress = (progress: DownloadProgress) => {
    switch (progress.status) {
      case "downloading":
        const percent =
          progress.loaded && progress.total
            ? Math.round((progress.loaded / progress.total) * 100)
            : 0;
        console.log`Downloading ${progress.file}: ${percent}%`;
        break;
      case "loading":
        console.log(`Downloading ${progress.file}...`);
        break;
      case "ready":
        console.log("Model is ready to use!");
        break;
      case "error":
        console.error("Error loading model:", progress);
        break;
    }
  };

  try {
    const extractor = await pipeline("feature-extraction", modelname, {
      //full size
      quantized: false,
      progress_callback: onModelDownloadProgress,
    });

    console.log("pipeline created successfully", extractor);

    for (const doc of docs) {
      await processDocument(client, indexName, namespace, doc, extractor);
    }
  } catch (error) {
    console.error("Error setting up pipline:", error);
  }
}

function processDocument(
  client: Pinecone,
  indexName: string,
  namespace: string,
  doc: Document<Record<string, any>>,
  extractor: FeatureExtractionPipeline
) {
  console.log(doc);
}
