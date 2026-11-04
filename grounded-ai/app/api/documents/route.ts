
import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

// How many days of annual leave do employees receive?

export async function POST(request: Request) {
  let parser: PDFParse | undefined;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a document." },
        { status: 400 }
      );
    }

    let text = "";

    if (file.name.toLowerCase().endsWith(".txt")) {
      text = await file.text();
    } else if (file.name.toLowerCase().endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());

      parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
    } else {
      return NextResponse.json(
        { error: "Please upload a TXT or PDF file." },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "No readable text found in the document." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Document read successfully!",
      fileName: file.name,
      content: text,
    });
  } catch (error) {
    console.error("Document reading error:", error);

    return NextResponse.json(
      { error: "Failed to read the document." },
      { status: 500 }
    );
  } finally {
    await parser?.destroy();
  }
}

