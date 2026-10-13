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

interface ActivityBlock {
  title: string;
  teacherLines: string[];
  studentLines: string[];
}

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

  // Parse extracted lesson metadata if present in content
  let parsedSubject = subject;
  let parsedGrade = grade;
  let parsedLesson = lessonTitle;

  for (const l of lines.slice(0, 10)) {
    const trimmed = l.trim();
    const monMatch = trimmed.match(/MÔN:\s*([^;]+)(?:;\s*LỚP:\s*([^\n\r]+))?/i);
    if (monMatch) {
      if (monMatch[1]?.trim()) parsedSubject = monMatch[1].trim();
      if (monMatch[2]?.trim()) parsedGrade = monMatch[2].trim();
    }
    const baiMatch = trimmed.match(/^BÀI\s*(?:…|\.{2,}|\d*)?\s*:\s*([^\n\r]+)/i);
    if (baiMatch && baiMatch[1]?.trim() && !baiMatch[1].includes("TRÍCH XUẤT")) {
      parsedLesson = baiMatch[1].trim();
    }
  }

  // Header Title matching KHBD_MAU.docx verbatim
  // 1. KẾ HOẠCH BÀI DẠY (Center, Bold, 14pt)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "KẾ HOẠCH BÀI DẠY",
          bold: true,
          size: 28, // 14pt
          font: "Times New Roman",
        }),
      ],
      spacing: { before: 0, after: 60, line: 276 },
    })
  );

  // 2. MÔN: ... ; LỚP: ... (Center, Bold, 13pt)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `MÔN: ${parsedSubject.toUpperCase()} ; LỚP: ${parsedGrade.toUpperCase()}`,
          bold: true,
          size: 26, // 13pt
          font: "Times New Roman",
        }),
      ],
      spacing: { after: 60, line: 276 },
    })
  );

  // 3. BÀI …: ... (Center, Bold, 13pt)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `BÀI: ${parsedLesson.toUpperCase()}`,
          bold: true,
          size: 26, // 13pt
          font: "Times New Roman",
        }),
      ],
      spacing: { after: 60, line: 276 },
    })
  );

  // 4. Ngày soạn: … /… /… (Center, Italic, 12pt)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Ngày soạn: … /… /…",
          italics: true,
          size: 24, // 12pt
          font: "Times New Roman",
        }),
      ],
      spacing: { after: 180, line: 276 },
    })
  );

  // Helper cell borders matching KHBD_MAU.docx (single, sz: 4)
  const standardBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  };

  // State machine for parsing content
  let inSectionIII = false;
  let inSectionIV = false;
  const activityBlocks: ActivityBlock[] = [];
  let currentActivity: ActivityBlock | null = null;
  let currentColumn: "teacher" | "student" = "teacher";

  // Scan through lines
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) continue;

    // Skip the top 4 header lines we already produced manually
    if (
      line.startsWith("KẾ HOẠCH BÀI DẠY") ||
      line.startsWith("MÔN:") ||
      line.startsWith("BÀI:") ||
      line.startsWith("BÀI …:") ||
      line.startsWith("Ngày soạn:")
    ) {
      continue;
    }

    // SECTION III START
    if (/^III\.\s*CÁC HOẠT ĐỘNG/i.test(line)) {
      inSectionIII = true;
      inSectionIV = false;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              bold: true,
              size: 26, // 13pt
              font: "Times New Roman",
            }),
          ],
          spacing: { before: 160, after: 80, line: 276 },
        })
      );
      continue;
    }

    // SECTION IV START
    if (/^IV\.\s*ĐIỀU CHỈNH/i.test(line)) {
      if (currentActivity) {
        activityBlocks.push(currentActivity);
        currentActivity = null;
      }
      inSectionIII = false;
      inSectionIV = true;

      // Build Section III Table before Section IV
      if (activityBlocks.length > 0) {
        children.push(createSectionIIITable(activityBlocks, standardBorder));
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              bold: true,
              size: 26, // 13pt
              font: "Times New Roman",
            }),
          ],
          spacing: { before: 180, after: 80, line: 276 },
        })
      );
      continue;
    }

    // INSIDE SECTION III: Collect activities
    if (inSectionIII) {
      // Check for activity title (1. Khởi động, 2. Khám phá, 3. Luyện tập, 4. Vận dụng...)
      const isActivityHeader = /^(?:[1-4]\.|\d+\.)\s*(?:Khởi động|Khám phá|Luyện tập|Vận dụng)/i.test(
        line
      );

      if (isActivityHeader) {
        if (currentActivity) {
          activityBlocks.push(currentActivity);
        }
        currentActivity = {
          title: line,
          teacherLines: [],
          studentLines: [],
        };
        currentColumn = "teacher";
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

      if (currentActivity) {
        if (currentColumn === "teacher") {
          currentActivity.teacherLines.push(line);
        } else {
          currentActivity.studentLines.push(line);
        }
      }
      continue;
    }

    // INSIDE SECTION IV: Dotted lines
    if (inSectionIV) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24,
              font: "Times New Roman",
            }),
          ],
          spacing: { after: 60, line: 276 },
        })
      );
      continue;
    }

    // OUTSIDE SECTION III & IV: Handle Section I and Section II
    const isSectionHeader = /^(?:I\.\s*YÊU CẦU CẦN ĐẠT|II\.\s*ĐỒ DÙNG DẠY HỌC)/i.test(
      line
    );
    const isSubHeader = /^(?:1\.\s*Kiến thức|2\.\s*Năng lực|3\.\s*Phẩm chất)/i.test(
      line
    );
    const isTeacherStudentTool = /^(?:-\s*Giáo viên:|-\s*Học sinh:)/i.test(line);
    const isIntegration =
      line.startsWith("*Tích hợp Năng lực số:") ||
      line.startsWith("*Tích hợp AI:") ||
      line.startsWith("*Tích hợp Trí tuệ nhân tạo");

    if (isSectionHeader) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              bold: true,
              size: 26, // 13pt
              font: "Times New Roman",
            }),
          ],
          spacing: { before: 140, after: 60, line: 276 },
        })
      );
    } else if (isSubHeader) {
      // Split label and content if on same line (e.g., "2. Năng lực: Năng lực tự chủ...")
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1 && colonIndex < line.length - 1) {
        const label = line.slice(0, colonIndex + 1);
        const rest = line.slice(colonIndex + 1);
        children.push(
          new Paragraph({
            alignment: AlignmentType.BOTH,
            children: [
              new TextRun({
                text: label,
                bold: true,
                size: 26, // 13pt
                font: "Times New Roman",
              }),
              new TextRun({
                text: rest,
                bold: false,
                size: 24, // 12pt
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 60, line: 276 },
          })
        );
      } else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 40, line: 276 },
          })
        );
      }
    } else if (isTeacherStudentTool) {
      const colonIndex = line.indexOf(":");
      const label = line.slice(0, colonIndex + 1);
      const rest = line.slice(colonIndex + 1);
      children.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          children: [
            new TextRun({
              text: label,
              bold: true,
              size: 24,
              font: "Times New Roman",
            }),
            new TextRun({
              text: rest,
              size: 24,
              font: "Times New Roman",
            }),
          ],
          spacing: { after: 60, line: 276 },
        })
      );
    } else if (isIntegration) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          children: [
            new TextRun({
              text: line,
              bold: true,
              size: 24,
              font: "Times New Roman",
            }),
          ],
          spacing: { after: 60, line: 276 },
        })
      );
    } else {
      // Regular bullet points or notes
      children.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          children: [
            new TextRun({
              text: line,
              size: 24, // 12pt
              font: "Times New Roman",
            }),
          ],
          spacing: { after: 50, line: 276 },
        })
      );
    }
  }

  // If content ended without Section IV, make sure Section III table is added
  if (inSectionIII && activityBlocks.length > 0) {
    children.push(createSectionIIITable(activityBlocks, standardBorder));
  }

  // Ensure Section IV exists if not in text
  if (!inSectionIV) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "IV. ĐIỀU CHỈNH SAU BÀI DẠY (Nếu có):",
            bold: true,
            size: 26,
            font: "Times New Roman",
          }),
        ],
        spacing: { before: 180, after: 80, line: 276 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "......................................................................................................................................................",
            size: 24,
            font: "Times New Roman",
          }),
        ],
        spacing: { after: 60, line: 276 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "......................................................................................................................................................",
            size: 24,
            font: "Times New Roman",
          }),
        ],
        spacing: { after: 60, line: 276 },
      })
    );
  }

  // Construct Word Document matching exact dimensions from KHBD_MAU.docx
  // Margins: Top = 1134 (2cm), Bottom = 1134 (2cm), Left = 1701 (3cm), Right = 850 (1.5cm)
  // Page: w = 11907, h = 16839
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11907,
              height: 16839,
            },
            margin: {
              top: 1134,
              bottom: 1134,
              left: 1701,
              right: 850,
              header: 720,
              footer: 720,
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `KHBD_${parsedGrade}_${parsedSubject}_${parsedLesson.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, "_")}.docx`;
  saveAs(blob, safeFilename);
}

// Function to create a clean 2-column Table matching KHBD_MAU.docx
function createSectionIIITable(
  activities: ActivityBlock[],
  cellBorder: Record<string, { style: (typeof BorderStyle)[keyof typeof BorderStyle]; size: number; color: string }>
): Table {
  // Column width: 4670 dxa each (exactly matching KHBD_MAU.docx XML: w:w="4670")
  const COL_WIDTH = 4670;

  const rows: TableRow[] = [];

  // 1. Header Row
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: COL_WIDTH, type: WidthType.DXA },
          borders: cellBorder,
          shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Hoạt động của giáo viên",
                  bold: true,
                  size: 26, // 13pt
                  font: "Times New Roman",
                }),
              ],
              spacing: { before: 80, after: 80, line: 276 },
            }),
          ],
        }),
        new TableCell({
          width: { size: COL_WIDTH, type: WidthType.DXA },
          borders: cellBorder,
          shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Hoạt động của học sinh",
                  bold: true,
                  size: 26, // 13pt
                  font: "Times New Roman",
                }),
              ],
              spacing: { before: 80, after: 80, line: 276 },
            }),
          ],
        }),
      ],
    })
  );

  // 2. Activity Rows (One unified row per activity for clean parallel layout)
  for (const act of activities) {
    const teacherParagraphs: Paragraph[] = [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text: act.title,
            bold: true,
            size: 26, // 13pt
            font: "Times New Roman",
          }),
        ],
        spacing: { before: 80, after: 60, line: 276 },
      }),
    ];

    if (act.teacherLines.length > 0) {
      for (const line of act.teacherLines) {
        teacherParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.BOTH,
            children: [
              new TextRun({
                text: line,
                size: 24, // 12pt
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 50, line: 276 },
          })
        );
      }
    } else {
      teacherParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: "...", font: "Times New Roman", size: 24 })],
          spacing: { after: 50, line: 276 },
        })
      );
    }

    const studentParagraphs: Paragraph[] = [];
    if (act.studentLines.length > 0) {
      for (const line of act.studentLines) {
        studentParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.BOTH,
            children: [
              new TextRun({
                text: line,
                size: 24, // 12pt
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 50, line: 276 },
          })
        );
      }
    } else {
      studentParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: "...", font: "Times New Roman", size: 24 })],
          spacing: { after: 50, line: 276 },
        })
      );
    }

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: COL_WIDTH, type: WidthType.DXA },
            borders: cellBorder,
            children: teacherParagraphs,
          }),
          new TableCell({
            width: { size: COL_WIDTH, type: WidthType.DXA },
            borders: cellBorder,
            children: studentParagraphs,
          }),
        ],
      })
    );
  }

  return new Table({
    width: { size: COL_WIDTH * 2, type: WidthType.DXA },
    rows: rows,
  });
}
