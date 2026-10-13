import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
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
  const children: (Paragraph | Table)[] = [];

  // Header Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `KẾ HOẠCH BÀI DẠY`,
          bold: true,
          size: 28, // 14pt
          font: "Times New Roman",
          color: "1F497D",
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
          text: `MÔN: ${subject.toUpperCase()} ; LỚP: ${grade.toUpperCase()}`,
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
      spacing: { after: 60 },
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Ngày soạn: .../.../...`,
          italics: true,
          size: 22,
          font: "Times New Roman",
          color: "595959",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Helper to create table cell borders
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
  };

  // State machine to parse activities into 2-column tables
  let inSectionIII = false;
  let currentActivityTitle = "";
  let currentActivityGoal = "";
  let teacherLines: string[] = [];
  let studentLines: string[] = [];
  let currentColumn: "none" | "teacher" | "student" = "none";

  const flushActivityTable = () => {
    if (!currentActivityTitle) return;

    // Activity Title
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: currentActivityTitle,
            bold: true,
            size: 24,
            font: "Times New Roman",
            color: "0F243E",
          }),
        ],
        spacing: { before: 140, after: 60 },
      })
    );

    // Activity Goal if present
    if (currentActivityGoal) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: currentActivityGoal,
              italics: true,
              size: 24,
              font: "Times New Roman",
              color: "006622",
              bold: true,
            }),
          ],
          spacing: { after: 80 },
        })
      );
    }

    // 2-Column Table for Teacher and Student
    const teacherParagraphs =
      teacherLines.length > 0
        ? teacherLines.map(
            (l) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: l,
                    size: 24,
                    font: "Times New Roman",
                  }),
                ],
                spacing: { after: 40 },
              })
          )
        : [
            new Paragraph({
              children: [new TextRun({ text: "...", font: "Times New Roman" })],
            }),
          ];

    const studentParagraphs =
      studentLines.length > 0
        ? studentLines.map(
            (l) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: l,
                    size: 24,
                    font: "Times New Roman",
                  }),
                ],
                spacing: { after: 40 },
              })
          )
        : [
            new Paragraph({
              children: [new TextRun({ text: "...", font: "Times New Roman" })],
            }),
          ];

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // Header Row
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              shading: { fill: "EBF2FA", type: ShadingType.CLEAR },
              borders: cellBorder,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "Hoạt động của giáo viên",
                      bold: true,
                      size: 24,
                      font: "Times New Roman",
                      color: "1F497D",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              shading: { fill: "EBF2FA", type: ShadingType.CLEAR },
              borders: cellBorder,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "Hoạt động của học sinh",
                      bold: true,
                      size: 24,
                      font: "Times New Roman",
                      color: "1F497D",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // Content Row
        new TableRow({
          children: [
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              borders: cellBorder,
              children: teacherParagraphs,
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              borders: cellBorder,
              children: studentParagraphs,
            }),
          ],
        }),
      ],
    });

    children.push(table);

    // Reset activity state
    currentActivityTitle = "";
    currentActivityGoal = "";
    teacherLines = [];
    studentLines = [];
    currentColumn = "none";
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) continue;

    // Detect Section III start
    if (/^III\.\s*CÁC HOẠT ĐỘNG/i.test(line)) {
      inSectionIII = true;
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: line,
              bold: true,
              size: 26,
              font: "Times New Roman",
              color: "1F497D",
            }),
          ],
          spacing: { before: 180, after: 100 },
        })
      );
      continue;
    }

    // Detect Section IV start
    if (/^IV\.\s*ĐIỀU CHỈNH/i.test(line)) {
      if (inSectionIII) {
        flushActivityTable();
        inSectionIII = false;
      }
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: line,
              bold: true,
              size: 26,
              font: "Times New Roman",
              color: "1F497D",
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
      continue;
    }

    // If inside Section III, handle activities
    if (inSectionIII) {
      // Activity header (1. Khởi động, 2. Khám phá, 3. Luyện tập, 4. Vận dụng)
      if (/^(1\.\s*Khởi động|2\.\s*Khám phá|3\.\s*Luyện tập|4\.\s*Vận dụng)/i.test(line)) {
        flushActivityTable();
        currentActivityTitle = line;
        continue;
      }

      if (line.startsWith("- Mục tiêu:") || line.startsWith("Mục tiêu:")) {
        currentActivityGoal = line;
        continue;
      }

      if (
        line.startsWith("- Hoạt động của giáo viên:") ||
        line.startsWith("Hoạt động của giáo viên:") ||
        line.startsWith("+ Hoạt động của giáo viên:")
      ) {
        currentColumn = "teacher";
        continue;
      }

      if (
        line.startsWith("- Hoạt động của học sinh:") ||
        line.startsWith("Hoạt động của học sinh:") ||
        line.startsWith("+ Hoạt động của học sinh:")
      ) {
        currentColumn = "student";
        continue;
      }

      if (currentColumn === "teacher") {
        teacherLines.push(line);
      } else if (currentColumn === "student") {
        studentLines.push(line);
      }
      continue;
    }

    // Outside Section III: Normal Paragraphs for Section I, II, IV
    const isSectionIorII =
      /^(I\.\s*YÊU CẦU CẦN ĐẠT|II\.\s*ĐỒ DÙNG DẠY HỌC)/i.test(line);

    const isSubHeading =
      /^(1\.\s*Kiến thức|2\.\s*Năng lực|3\.\s*Phẩm chất|1\.\s*Giáo viên|2\.\s*Học sinh)/i.test(
        line
      );

    const isDigitalHighlight =
      line.startsWith("*Tích hợp Năng lực số:") ||
      line.includes("CB1") ||
      line.includes("[Mã");

    children.push(
      new Paragraph({
        heading: isSectionIorII
          ? HeadingLevel.HEADING_1
          : isSubHeading
          ? HeadingLevel.HEADING_2
          : undefined,
        children: [
          new TextRun({
            text: line,
            bold: isSectionIorII || isSubHeading || isDigitalHighlight,
            color: isSectionIorII
              ? "1F497D"
              : isDigitalHighlight
              ? "006622"
              : isSubHeading
              ? "0F243E"
              : "000000",
            size: isSectionIorII ? 26 : 24,
            font: "Times New Roman",
          }),
        ],
        spacing: { after: 60 },
      })
    );
  }

  // Ensure last activity flushed if ended inside Section III
  if (inSectionIII) {
    flushActivityTable();
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 2.54cm
              right: 1440,
              bottom: 1440,
              left: 1700, // 3cm
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `KHBD_${grade}_${subject}_${lessonTitle.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, "_")}.docx`;
  saveAs(blob, safeFilename);
}
