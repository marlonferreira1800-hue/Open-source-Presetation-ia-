import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { SlideNodeSchema } from "@/types/presentation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { prompt, currentSlide, action } = await req.json();

    if (!currentSlide) {
      return NextResponse.json({ error: "Slide atual não fornecido." }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;

    // Fallback inteligente caso não haja API key configurada
    if (!apiKey) {
      console.warn("NVIDIA_API_KEY não configurada. Aplicando transformação Clip-E simulada.");
      
      const updatedSlide = JSON.parse(JSON.stringify(currentSlide));
      
      if (action === "shorten" || prompt?.toLowerCase().includes("encurtar") || prompt?.toLowerCase().includes("resumir")) {
        updatedSlide.subtitle = "Versão condensada para máxima retenção e impacto executivo.";
        updatedSlide.elements = updatedSlide.elements.map((el: any) => ({
          ...el,
          content: el.content.length > 50 ? el.content.slice(0, 45) + "..." : el.content
        }));
      } else if (action === "metrics" || prompt?.toLowerCase().includes("métrica") || prompt?.toLowerCase().includes("kpi")) {
        updatedSlide.layout = "metrics_kpi";
        updatedSlide.title = "Indicadores Chave & Métricas de Performance";
        updatedSlide.elements = [
          { id: "m1", type: "metric", label: "Crescimento Anual", content: "+145%", meta: { trend: "vs ano anterior", trendPositive: true } },
          { id: "m2", type: "metric", label: "Eficiência Operacional", content: "3.2x", meta: { trend: "+220%", trendPositive: true } },
          { id: "m3", type: "metric", label: "Retenção Líquida", content: "96.4%", meta: { trend: "Topo do setor", trendPositive: true } }
        ];
      } else if (action === "executive" || prompt?.toLowerCase().includes("formal") || prompt?.toLowerCase().includes("executivo")) {
        updatedSlide.title = "Alinhamento Estratégico & Projeção Executiva";
        updatedSlide.subtitle = "Diretrizes corporativas focadas em geração contínua de valor e resiliência.";
      } else {
        updatedSlide.subtitle = `Otimizado por Clip-E: ${prompt || "Refinamento contextual aplicado com sucesso."}`;
      }

      return NextResponse.json(updatedSlide);
    }

    // Chamada oficial à API do NVIDIA NIM
    const nvidia = createOpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: apiKey
    });

    const systemPrompt = `Você é o Clip-E, o assistente inteligente de design e conteúdo do Presentations.ai.
Sua tarefa é modificar e aprimorar o slide atual fornecido em JSON, seguindo as instruções do usuário.
Você deve retornar o slide atualizado exatamente no mesmo schema (SlideNodeSchema).
Mantenha o tom executivo e sofisticado em Português do Brasil.`;

    const { object } = await generateObject({
      model: nvidia("meta/llama-3.3-70b-instruct"),
      schema: SlideNodeSchema,
      system: systemPrompt,
      prompt: `Instrução do usuário: "${prompt}"\n\nSlide Atual:\n${JSON.stringify(currentSlide, null, 2)}`
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Erro no Clip-E:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao processar instrução com Clip-E" },
      { status: 500 }
    );
  }
}
