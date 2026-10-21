import pptxgen from "pptxgenjs";
import { PresentationDoc } from "@/types/presentation";
import { getMoodById } from "@/lib/moods";

export async function exportToPPTX(doc: PresentationDoc) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = doc.title;

  const mood = getMoodById(doc.moodId);

  // Strip '#' from hex codes for pptxgenjs
  const cleanHex = (hex: string) => {
    if (hex.startsWith("#")) return hex.substring(1);
    if (hex.startsWith("rgba") || hex.startsWith("rgb")) return "1E293B"; // Fallback for rgba
    return hex;
  };

  const bgHex = cleanHex(mood.colors.bg);
  const primaryHex = cleanHex(mood.colors.primary);
  const surfaceHex = cleanHex(mood.colors.surface);
  const textPrimaryHex = cleanHex(mood.colors.textPrimary);
  const textSecondaryHex = cleanHex(mood.colors.textSecondary);
  const textMutedHex = cleanHex(mood.colors.textMuted);

  for (let i = 0; i < doc.slides.length; i++) {
    const slideNode = doc.slides[i];
    const pptxSlide = pptx.addSlide();
    pptxSlide.background = { color: bgHex };

    // Slide Number (Bottom Right)
    pptxSlide.addText(`SLIDE ${String(i + 1).padStart(2, "0")}`, {
      x: 10.5,
      y: 7.0,
      w: 2.3,
      h: 0.3,
      fontSize: 10,
      fontFace: "Arial",
      color: textMutedHex,
      align: "right"
    });

    // Badge
    if (slideNode.accentBadge) {
      pptxSlide.addText(slideNode.accentBadge.toUpperCase(), {
        x: 0.8,
        y: 0.6,
        w: 5.0,
        h: 0.3,
        fontSize: 10,
        fontFace: "Arial",
        color: primaryHex,
        bold: true
      });
    }

    // Title
    pptxSlide.addText(slideNode.title, {
      x: 0.8,
      y: 0.9,
      w: 11.5,
      h: 0.9,
      fontSize: 28,
      fontFace: "Arial",
      color: textPrimaryHex,
      bold: true
    });

    // Subtitle
    if (slideNode.subtitle) {
      pptxSlide.addText(slideNode.subtitle, {
        x: 0.8,
        y: 1.8,
        w: 11.5,
        h: 0.6,
        fontSize: 15,
        fontFace: "Arial",
        color: textSecondaryHex
      });
    }

    // Layout-specific geometry
    switch (slideNode.layout) {
      case "hero_title": {
        const authorEl = slideNode.elements.find((e) => e.type === "label" || e.id.includes("author"));
        if (authorEl) {
          pptxSlide.addText(authorEl.content, {
            x: 0.8,
            y: 6.2,
            w: 8.0,
            h: 0.4,
            fontSize: 14,
            fontFace: "Arial",
            color: primaryHex,
            bold: true
          });
        }
        break;
      }

      case "metrics_kpi": {
        const metrics = slideNode.elements.filter((e) => e.type === "metric");
        metrics.forEach((m, idx) => {
          const colW = 3.5;
          const posX = 0.8 + idx * (colW + 0.4);

          // Card Box
          pptxSlide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: 2.8,
            w: colW,
            h: 3.5,
            fill: { color: surfaceHex },
            line: { color: primaryHex, width: 1 }
          });

          // Label
          pptxSlide.addText(m.label || `Métrica ${idx + 1}`, {
            x: posX + 0.3,
            y: 3.1,
            w: colW - 0.6,
            h: 0.4,
            fontSize: 13,
            fontFace: "Arial",
            color: textMutedHex,
            bold: true
          });

          // Metric Value
          pptxSlide.addText(m.content, {
            x: posX + 0.3,
            y: 3.7,
            w: colW - 0.6,
            h: 1.0,
            fontSize: 42,
            fontFace: "Arial",
            color: primaryHex,
            bold: true
          });
        });
        break;
      }

      case "columns_3": {
        const cols = slideNode.elements.filter((e) => e.type === "text" || !e.type);
        cols.slice(0, 3).forEach((col, idx) => {
          const colW = 3.6;
          const posX = 0.8 + idx * (colW + 0.35);

          pptxSlide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: 2.8,
            w: colW,
            h: 3.8,
            fill: { color: surfaceHex },
            line: { color: "334155", width: 1 }
          });

          pptxSlide.addText(col.label || `Pilar ${idx + 1}`, {
            x: posX + 0.3,
            y: 3.1,
            w: colW - 0.6,
            h: 0.5,
            fontSize: 16,
            fontFace: "Arial",
            color: textPrimaryHex,
            bold: true
          });

          pptxSlide.addText(col.content, {
            x: posX + 0.3,
            y: 3.8,
            w: colW - 0.6,
            h: 2.4,
            fontSize: 13,
            fontFace: "Arial",
            color: textSecondaryHex
          });
        });
        break;
      }

      case "problem_solution": {
        const prob = slideNode.elements[0] || { label: "O Problema", content: "" };
        const sol = slideNode.elements[1] || { label: "A Solução", content: "" };

        // Problem Box
        pptxSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: 2.8,
          w: 5.6,
          h: 3.8,
          fill: { color: "2A1215" },
          line: { color: "EF4444", width: 1.5 }
        });
        pptxSlide.addText(prob.label || "O Problema", {
          x: 1.2,
          y: 3.2,
          w: 4.8,
          h: 0.5,
          fontSize: 18,
          fontFace: "Arial",
          color: "EF4444",
          bold: true
        });
        pptxSlide.addText(prob.content, {
          x: 1.2,
          y: 3.9,
          w: 4.8,
          h: 2.3,
          fontSize: 14,
          fontFace: "Arial",
          color: textSecondaryHex
        });

        // Solution Box
        pptxSlide.addShape(pptx.ShapeType.roundRect, {
          x: 6.8,
          y: 2.8,
          w: 5.6,
          h: 3.8,
          fill: { color: surfaceHex },
          line: { color: primaryHex, width: 2 }
        });
        pptxSlide.addText(sol.label || "A Solução", {
          x: 7.2,
          y: 3.2,
          w: 4.8,
          h: 0.5,
          fontSize: 18,
          fontFace: "Arial",
          color: primaryHex,
          bold: true
        });
        pptxSlide.addText(sol.content, {
          x: 7.2,
          y: 3.9,
          w: 4.8,
          h: 2.3,
          fontSize: 14,
          fontFace: "Arial",
          color: textPrimaryHex
        });
        break;
      }

      case "quote_testimonial": {
        const quote = slideNode.elements.find((e) => e.type === "text")?.content || slideNode.title;
        const author = slideNode.elements.find((e) => e.type === "label" || e.id.includes("author"));

        pptxSlide.addText(`“${quote}”`, {
          x: 1.5,
          y: 3.2,
          w: 10.0,
          h: 2.2,
          fontSize: 26,
          fontFace: "Arial",
          color: textPrimaryHex,
          italic: true
        });

        if (author) {
          pptxSlide.addText(author.content, {
            x: 1.5,
            y: 5.4,
            w: 8.0,
            h: 0.4,
            fontSize: 16,
            fontFace: "Arial",
            color: primaryHex,
            bold: true
          });
        }
        break;
      }

      default: {
        slideNode.elements.forEach((el, idx) => {
          pptxSlide.addText(`• ${el.label ? el.label + ': ' : ''}${el.content}`, {
            x: 1.0,
            y: 2.8 + idx * 0.9,
            w: 11.0,
            h: 0.7,
            fontSize: 14,
            fontFace: "Arial",
            color: textSecondaryHex
          });
        });
        break;
      }
    }
  }

  // Trigger browser download
  await pptx.writeFile({ fileName: `${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.pptx` });
}
