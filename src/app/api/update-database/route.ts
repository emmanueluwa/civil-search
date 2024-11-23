import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { NextApiRequest, NextApiResponse } from "next";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Pinecone } from "@pinecone-database/pinecone";
import { updateVectorDB } from "@/utils";
import { NameArraySchema } from "@/lib/validators/name";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: NextApiResponse) {
  if (!req.body) return;

  const body = await req.json();

  try {
    const { indexName, namespace } = body;
    const parsedIndexName = NameArraySchema.parse(indexName);
    const parsedNamespace = NameArraySchema.parse(namespace);

    await handleUpload(parsedIndexName, parsedNamespace, res);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function handleUpload(
  indexName: string,
  namespace: string,
  res: NextApiResponse
) {
  const loader = new DirectoryLoader("src/documents", {
    ".pdf": (path: string) => new PDFLoader(path, { splitPages: false }),
    ".txt": (path: string) => new TextLoader(path),
  });

  const docs = await loader.load();

  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  await updateVectorDB(
    client,
    indexName,
    namespace,
    docs,
    (filename, totalChunks, chunksUpserted, isComplete) => {
      if (!isComplete) {
        res.write(
          JSON.stringify({
            filename,
            totalChunks,
            chunksUpserted,
            isComplete,
          })
        );
        return res.json("");
      } else {
        res.end();
      }
    }
  );
}
