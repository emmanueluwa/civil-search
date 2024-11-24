import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FeatureExtractionPipeline, pipeline, env } from "@xenova/transformers";
import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { batchSize } from "./config";

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

async function processDocument(
  client: Pinecone,
  indexName: string,
  namespace: string,
  doc: Document<Record<string, any>>,
  extractor: FeatureExtractionPipeline
) {
  const splitter = new RecursiveCharacterTextSplitter();

  const documentChunks = await splitter.splitText(doc.pageContent);

  const filename = getFilename(doc.metadata.source);

  console.log("number of chunks! ", documentChunks.length);
  let chunkBatchIndex = 0;

  while (documentChunks.length) {
    chunkBatchIndex++;
    const chunkBatch = documentChunks.splice(0, batchSize);

    await processOneBatch(
      client,
      indexName,
      namespace,
      extractor,
      chunkBatch,
      chunkBatchIndex,
      filename
    );
  }
}

function getFilename(filename: string): string {
  const document = filename.substring(filename.lastIndexOf("/") + 1);

  return document.substring(0, document.lastIndexOf(".")) || document;
}

async function processOneBatch(
  client: Pinecone,
  indexName: string,
  namespace: string,
  extractor: FeatureExtractionPipeline,
  chunkBatch: string[],
  chunkBatchIndex: number,
  filename: string
) {
  //cleaning chunkbatch and generate embeddings
  const output = await extractor(
    chunkBatch.map((str) => str.replace(/\n/g, " ")),
    {
      //consistent size
      pooling: "cls",
    }
  );

  //convert tensor to js array
  const embeddingsBatch = output.tolist();
  let vectorBatch: PineconeRecord<RecordMetadata>[] = [];

  for (let i = 0; i < chunkBatch.length; i++) {
    //extract chunk and corresponding embedding
    const chunk = chunkBatch[i];
    const embedding = embeddingsBatch[i];

    //save embedding in vector store 1024 dim space, text chunk is stored as metadata
    const vector: PineconeRecord<RecordMetadata> = {
      id: `${filename}-${chunkBatchIndex}-${i}`,
      values: embedding,
      metadata: {
        chunk,
      },
    };

    vectorBatch.push(vector);
  }

  const index = client.index(indexName).namespace(namespace);

  await index.upsert(vectorBatch);
  console.log("upserting index.. :)");

  vectorBatch = [];
}
