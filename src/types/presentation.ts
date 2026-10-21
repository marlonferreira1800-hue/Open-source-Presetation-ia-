import { z } from "zod";

export const SlideLayoutType = z.enum([
  "hero_title",           // Capa de impacto com título, subtítulo e metadata
  "metrics_kpi",          // Cards de métricas/indicadores comparativos
  "columns_3",            // 3 colunas estruturadas com ícones, títulos e textos
  "timeline_horizontal",  // Linha do tempo/roteiro em etapas sequenciais
  "problem_solution",     // Divisão comparativa (O Problema vs. A Solução)
  "quote_testimonial",    // Citação em destaque com autor e cargo
  "feature_split"         // Destaque visual (imagem/diagrama) à esquerda e tópicos à direita
]);

export type SlideLayoutType = z.infer<typeof SlideLayoutType>;

export const SlideElementSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "metric", "icon", "image", "badge", "label"]),
  label: z.string().optional(),
  content: z.string(),
  meta: z.record(z.any()).optional()
});

export type SlideElement = z.infer<typeof SlideElementSchema>;

export const SlideNodeSchema = z.object({
  id: z.string(),
  layout: SlideLayoutType,
  title: z.string(),
  subtitle: z.string().optional(),
  elements: z.array(SlideElementSchema),
  speakerNotes: z.string().optional(),
  accentBadge: z.string().optional()
});

export type SlideNode = z.infer<typeof SlideNodeSchema>;

export const MoodThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["dark", "light", "vibrant", "corporate"]),
  colors: z.object({
    bg: z.string(),
    surface: z.string(),
    surfaceBorder: z.string(),
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    textPrimary: z.string(),
    textSecondary: z.string(),
    textMuted: z.string()
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string()
  })
});

export type MoodTheme = z.infer<typeof MoodThemeSchema>;

export const PresentationDocSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  moodId: z.string(),
  aspectRatio: z.enum(["16:9", "4:3"]).default("16:9"),
  slides: z.array(SlideNodeSchema)
});

export type PresentationDoc = z.infer<typeof PresentationDocSchema>;
