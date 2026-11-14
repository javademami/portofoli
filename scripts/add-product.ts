import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { connectDB } from "../lib/mongodb";
import { Product } from "../models/Product";

type Args = {
  file: string;
  slug: string;
  title: string;
  description: string;
  price: string;
};

function parseArgs(argv: string[]): Partial<Args> {
  const opts: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "");
    opts[key] = argv[i + 1] ?? "";
  }
  return opts as Partial<Args>;
}

function contentTypeFor(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

async function main() {
  const { file, slug, title, description, price } = parseArgs(
    process.argv.slice(2)
  );

  if (!file || !slug || !title || !description || !price) {
    console.error(
      "Usage: npx tsx --env-file=.env.local scripts/add-product.ts --file <path> --slug <slug> --title <title> --description <text> --price <SEK>"
    );
    process.exit(1);
  }

  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const priceSek = Number(price);
  if (!Number.isFinite(priceSek) || priceSek < 0) {
    console.error(`Invalid price: ${price}`);
    process.exit(1);
  }

  const ext = path.extname(file);
  const key = `products/${slug}-${Date.now()}${ext}`;
  const fileBuffer = fs.readFileSync(file);

  const s3 = new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: fileBuffer,
      ContentType: contentTypeFor(ext),
    })
  );

  await connectDB();

  const product = await Product.create({
    slug,
    title,
    description,
    priceSek,
    fileKey: key,
    fileName: path.basename(file),
    published: true,
  });

  console.log(
    `Product created: ${product.slug} — file uploaded to R2 as ${key}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});