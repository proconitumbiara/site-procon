import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { extname } from "path";

const DENUNCIATIONS_DOCUMENTS_FOLDER = "denunciations/documents";
const DENUNCIATIONS_MEDIA_FOLDER = "denunciations/media";

const PDF_ONLY_FOLDERS = new Set([
  "complaints",
  "consultations",
  "denunciations",
  DENUNCIATIONS_DOCUMENTS_FOLDER,
  "gincana-authorization",
]);
const IMAGE_ONLY_FOLDERS = new Set(["news", "projects", "services"]);
const FLEX_FOLDERS = new Set(["temp"]);
const DENUNCIATIONS_MEDIA_FOLDERS = new Set([DENUNCIATIONS_MEDIA_FOLDER]);
const ALLOWED_FOLDERS = new Set([
  ...PDF_ONLY_FOLDERS,
  ...IMAGE_ONLY_FOLDERS,
  ...FLEX_FOLDERS,
  ...DENUNCIATIONS_MEDIA_FOLDERS,
]);

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 },
      );
    }

    if (!type || !ALLOWED_FOLDERS.has(type)) {
      return NextResponse.json(
        { error: "Pasta de destino inválida." },
        { status: 400 },
      );
    }

    const fileExtensionFromName = extname(file.name).toLowerCase();

    const isPdf = file.type === "application/pdf" || fileExtensionFromName === ".pdf";
    const isImage = file.type.startsWith("image/");
    const isJpg =
      file.type === "image/jpeg" ||
      fileExtensionFromName === ".jpg" ||
      fileExtensionFromName === ".jpeg";
    const isPng =
      file.type === "image/png" || fileExtensionFromName === ".png";
    const isAllowedDenunciationsMediaImage = isJpg || isPng;

    const isMp4 = file.type === "video/mp4" || fileExtensionFromName === ".mp4";
    const isMp3 =
      file.type === "audio/mpeg" ||
      file.type === "audio/mp3" ||
      fileExtensionFromName === ".mp3";

    if (PDF_ONLY_FOLDERS.has(type) && !isPdf) {
      return NextResponse.json(
        { error: "Apenas arquivos PDF são permitidos para este tipo." },
        { status: 400 },
      );
    }

    if (IMAGE_ONLY_FOLDERS.has(type) && !isImage) {
      return NextResponse.json(
        { error: "Apenas imagens são permitidas para este tipo." },
        { status: 400 },
      );
    }

    if (
      DENUNCIATIONS_MEDIA_FOLDERS.has(type) &&
      !(
        isAllowedDenunciationsMediaImage ||
        isMp4 ||
        isMp3
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Apenas evidências válidas são permitidas: JPG/PNG, MP4 e MP3.",
        },
        { status: 400 },
      );
    }

    // Para os destinos antigos, mantemos a regra de aceitar apenas PDF ou imagens.
    // Para `denunciations/media`, aceitamos também MP4/MP3.
    if (!isPdf && !isImage && !DENUNCIATIONS_MEDIA_FOLDERS.has(type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado." },
        { status: 400 },
      );
    }

    const idPrefix = (formData.get("idPrefix") as string | null) ?? null;
    const indexRaw = (formData.get("index") as string | null) ?? null;
    const indexNumber = indexRaw ? Number(indexRaw) : NaN;
    const hasDeterministicNaming =
      typeof idPrefix === "string" &&
      /^\d{6}$/.test(idPrefix) &&
      Number.isFinite(indexNumber) &&
      Number.isInteger(indexNumber) &&
      indexNumber > 0;

    if (hasDeterministicNaming) {
      const indexPad = String(indexNumber).padStart(2, "0");

      let extension = "";
      let fileBaseName = "";

      if (type === DENUNCIATIONS_DOCUMENTS_FOLDER) {
        extension = ".pdf";
        fileBaseName = `doc${indexPad}-${idPrefix}`;
      } else if (type === DENUNCIATIONS_MEDIA_FOLDER) {
        if (isAllowedDenunciationsMediaImage) {
          extension = isPng ? ".png" : ".jpg";
          fileBaseName = `img${indexPad}-${idPrefix}`;
        } else if (isMp4) {
          extension = ".mp4";
          fileBaseName = `vid${indexPad}-${idPrefix}`;
        } else if (isMp3) {
          extension = ".mp3";
          fileBaseName = `vid${indexPad}-${idPrefix}`;
        }
      }

      if (fileBaseName && extension) {
        const fileName = `${fileBaseName}${extension}`;
        const blobPath = `${type}/${idPrefix}/${fileName}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const blob = await put(blobPath, buffer, {
          access: "public",
          contentType: file.type,
        });

        return NextResponse.json({
          success: true,
          fileUrl: blob.url,
          fileName,
        });
      }
      // Se não conseguiu determinar corretamente o nome, cai para o modo aleatório.
    }

    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 8);
    let extension = extname(file.name).toLowerCase();

    if (!extension) {
      extension = isPdf ? ".pdf" : IMAGE_MIME_TO_EXT[file.type] ?? ".bin";
    }

    if (isImage && IMAGE_ONLY_FOLDERS.has(type)) {
      extension = IMAGE_MIME_TO_EXT[file.type] ?? extension;
    }

    const fileName = `${timestamp}_${randomPart}${extension}`;
    const blobPath = `${type}/${fileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      fileUrl: blob.url,
      fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 },
    );
  }
}