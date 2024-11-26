import fs from "fs";

export async function GET() {
  //list of filenames
  const files = fs.readdirSync("src/documents");

  return Response.json(files);
}
