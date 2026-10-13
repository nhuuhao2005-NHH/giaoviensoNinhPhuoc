import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import saveAs from "file-saver";

export async function exportLessonToWord({
  lessonTitle,
  subject,
  grade,
  content,
}: {
  lessonTitle: string;
  subject: string;
  grade: string;
  content: string;
}) {
  const lines = content.split("\n");
  const children: Paragraph[] = [];

  // Header Tiêu đề trường/Bộ môn
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `KẾ HOẠCH BÀI DẠY (TÍCH HỢP NĂNG LỰC SỐ)`,
          bold: true,
          size: 28, // 14pt
          font: "Times New Roman",
          color: "1F497D",
        }),
      ],
      spacing: { after: 120 },
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `MÔN: ${subject.toUpperCase()} - ${grade.toUpperCase()}`,
          bold: true,
          size: 26, // 13pt
          font: "Times New Roman",
        }),
      ],
      spacing: { after: 60 },
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `BÀI: ${lessonTitle.toUpperCase()}`,
          bold: true,
          size: 26,
          font: "Times New Roman",
          color: "C00000",
        }),
      ],
      spacing: { after: 240 },
    })
  );

  // Parse lines into Word paragraphs
  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      children.push(
        new Paragraph({
          children: [new TextRun("")],
          spacing: { after: 100 },
        })
      );
      continue;
    }

    // Heading I, II, III
    if (/^(I|II|III|IV|V)\.\s/i.test(line)) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: line,
              bold: true,
              size: 26, // 13pt
              font: "Times New Roman",
              color: "1F497D",
            }),
          ],
          spacing: { before: 200, after: 120 },
        })
      );
      continue;
    }

    // Heading 1. 2. 3. or HOẠT ĐỘNG
    if (/^(\d+\.|HOẠT ĐỘNG)/i.test(line)) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: line,
              bold: true,
              size: 24, // 12pt
              font: "Times New Roman",
            }),
          ],
          spacing: { before: 140, after: 80 },
        })
      );
      continue;
    }

    // Highlight Digital Competency lines
    const isDigitalHighlight =
      line.includes("NĂNG LỰC SỐ") ||
      line.includes("CÔNG CỤ SỐ") ||
      line.includes("[TÍCH HỢP NĂNG LỰC SỐ]");

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            bold: isDigitalHighlight,
            color: isDigitalHighlight ? "004D40" : "000000",
            size: 24,
            font: "Times New Roman",
          }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 dxa (2.54cm)
              right: 1440,
              bottom: 1440,
              left: 1700, // 3cm for binding
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `Giao_an_${subject}_${grade}_${lessonTitle.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, "_")}.docx`;
  saveAs(blob, safeFilename);
}
