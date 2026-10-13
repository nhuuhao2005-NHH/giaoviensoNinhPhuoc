import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
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

  // Tiêu đề Kế hoạch bài dạy theo CV 2345
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `KẾ HOẠCH BÀI DẠY CẤP TIỂU HỌC`,
          bold: true,
          size: 28, // 14pt
          font: "Times New Roman",
          color: "1F497D",
        }),
      ],
      spacing: { after: 80 },
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `(Chuẩn Công văn 2345/BGDĐT-GDTH - Tích hợp Khung Năng lực số Lớp 1-3)`,
          italics: true,
          size: 22, // 11pt
          font: "Times New Roman",
          color: "595959",
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
      spacing: { after: 200 },
    })
  );

  // Parse từng dòng
  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      children.push(
        new Paragraph({
          children: [new TextRun("")],
          spacing: { after: 60 },
        })
      );
      continue;
    }

    // Heading I, II, III, IV (Các phần lớn của CV 2345)
    if (/^(I|II|III|IV)\.\s/i.test(line)) {
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
          spacing: { before: 180, after: 100 },
        })
      );
      continue;
    }

    // Heading 1. 2. 3. 4. hoặc HOẠT ĐỘNG
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
              color: "0F243E",
            }),
          ],
          spacing: { before: 120, after: 60 },
        })
      );
      continue;
    }

    // Hoạt động của giáo viên / Hoạt động của học sinh
    const isTeacherStudentStep =
      line.startsWith("+ Hoạt động của giáo viên") ||
      line.startsWith("+ Hoạt động của học sinh") ||
      line.startsWith("Hoạt động của giáo viên") ||
      line.startsWith("Hoạt động của học sinh") ||
      line.startsWith("- Mục tiêu:") ||
      line.startsWith("- Cách tiến hành:");

    // Highlight Mã chỉ báo năng lực số [Mã ...]
    const isIndicatorHighlight =
      line.includes("CB1") ||
      line.includes("[Mã") ||
      line.includes("NĂNG LỰC SỐ") ||
      line.includes("Năng lực số");

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            bold: isTeacherStudentStep || isIndicatorHighlight,
            color: isIndicatorHighlight
              ? "006622"
              : isTeacherStudentStep
              ? "1F497D"
              : "000000",
            size: 24, // 12pt
            font: "Times New Roman",
          }),
        ],
        spacing: { after: 60 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (2.54cm)
              right: 1440,
              bottom: 1440,
              left: 1700, // 3cm mép gáy sách
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `Giao_an_Tieu_hoc_${grade}_${subject}_${lessonTitle.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, "_")}.docx`;
  saveAs(blob, safeFilename);
}
