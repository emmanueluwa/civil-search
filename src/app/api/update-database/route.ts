import { NextApiResponse } from "next";
import { Pinecone } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { NameArraySchema } from "@/lib/validators/name";
import { updateVectorDB } from "@/utils";

export async function POST(req: Request, res: NextApiResponse) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await req.json();
        const { indexName, namespace } = body;

        // Load documents (adjust path and loaders as needed)
        const loader = new DirectoryLoader("src/documents", {
          ".pdf": (path: string) => new PDFLoader(path, { splitPages: false }),
          ".txt": (path: string) => new TextLoader(path),
        });
        const docs = await loader.load();

        // Initialize Pinecone client
        const client = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY!,
        });

        const parsedIndexName = NameArraySchema.parse(indexName);
        const parsedNamespace = NameArraySchema.parse(namespace);

        await updateVectorDB(
          client,
          parsedIndexName,
          parsedNamespace,
          docs,
          (filename, totalChunks, chunksUpserted, isComplete) => {
            const message =
              JSON.stringify({
                filename,
                totalChunks,
                chunksUpserted,
                isComplete,
              }) + "\n";

            controller.enqueue(encoder.encode(message));

            if (isComplete) {
              controller.close();
            }
          }
        );
      } catch (error) {
        controller.error(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
