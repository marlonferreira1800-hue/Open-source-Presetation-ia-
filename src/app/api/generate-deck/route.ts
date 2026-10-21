import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { PresentationDocSchema } from "@/types/presentation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { prompt, slideCount = 6, moodId = "nvidia-emerald" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "O prompt é obrigatório." }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;

    // Se a chave não estiver configurada no .env, retornamos uma geração inteligente local para teste imediato
    if (!apiKey) {
      console.warn("NVIDIA_API_KEY não encontrada no .env. Gerando deck sintético de demonstração.");
      
      const demoDeck = {
        id: "deck_" + Date.now(),
        title: prompt.slice(0, 50),
        description: `Apresentação estruturada gerada para: "${prompt}"`,
        moodId,
        aspectRatio: "16:9",
        slides: [
          {
            id: "s1",
            layout: "hero_title",
            title: prompt.slice(0, 45),
            subtitle: "Visão estratégica de implementação, arquitetura escalável e retorno sobre investimento.",
            accentBadge: "Visão Estratégica 2026",
            elements: [
              { id: "e1", type: "label", label: "Curadoria", content: "Acelerado por NVIDIA NIM & Origami Engine" }
            ]
          },
          {
            id: "s2",
            layout: "problem_solution",
            title: "O Desafio vs. A Nova Abordagem",
            subtitle: "Superando os limites de abordagens tradicionais com computação acelerada",
            accentBadge: "Diagnóstico",
            elements: [
              { id: "e2", type: "text", label: "O Gargalo Atual", content: "Processos manuais e silos legados causam até 40% de lentidão nas entregas operacionais." },
              { id: "e3", type: "text", label: "A Solução Proposta", content: "Automação orientada a microsserviços integrados a LLMs especializados de baixa latência." }
            ]
          },
          {
            id: "s3",
            layout: "metrics_kpi",
            title: "Projeções e Eficiência Operacional",
            subtitle: "Métricas consolidadas estimadas após 90 dias de implantação",
            accentBadge: "KPIs de Sucesso",
            elements: [
              { id: "m1", type: "metric", label: "Redução de Tempo", content: "75%", meta: { trend: "+4x veloz", trendPositive: true } },
              { id: "m2", type: "metric", label: "Economia Anual", content: "R$ 480k", meta: { trend: "-38% custos", trendPositive: true } },
              { id: "m3", type: "metric", label: "NPS dos Usuários", content: "92", meta: { trend: "+24 pts", trendPositive: true } }
            ]
          },
          {
            id: "s4",
            layout: "columns_3",
            title: "Plano Estrutural de Execução",
            subtitle: "Três etapas coordenadas para garantir transição suave e governança",
            accentBadge: "Roteiro Técnico",
            elements: [
              { id: "c1", type: "text", label: "Fase 1: Setup & Dados", content: "Padronização das fontes de dados e configuração de chaves seguras." },
              { id: "c2", type: "text", label: "Fase 2: Homologação", content: "Testes de carga com amostragens reais em ambiente isolado." },
              { id: "c3", type: "text", label: "Fase 3: Expansão", content: "Lançamento corporativo com monitoramento contínuo de SLOs." }
            ]
          },
          {
            id: "s5",
            layout: "quote_testimonial",
            title: "Diretriz Central",
            subtitle: "O princípio que orienta cada decisão do projeto",
            accentBadge: "Filosofia",
            elements: [
              { id: "q1", type: "text", content: "A verdadeira inovação não está em complicar a arquitetura, mas em tornar a tecnologia invisível para quem a utiliza." },
              { id: "q2", type: "label", label: "Princípio Operacional", content: "Decifrando Dados • Arquitetura & Inovação" }
            ]
          }
        ]
      };

      return NextResponse.json(demoDeck);
    }

    // Configuração oficial NVIDIA NIM (OpenAI compatible API)
    const nvidia = createOpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: apiKey
    });

    const systemPrompt = `Você é um Diretor de Apresentações Executivas de classe mundial no estilo Presentations.ai.
Sua missão é criar uma apresentação corporativa persuasiva, profissional e completa em Português do Brasil com base no briefing do usuário.
Gere exatamente ${slideCount} slides utilizando uma combinação equilibrada dos layouts disponíveis:
- 'hero_title': apenas no slide de abertura/capa.
- 'problem_solution': para contrastar a dor com a oportunidade.
- 'metrics_kpi': para apresentar 3 dados quantitativos ou indicadores de impacto.
- 'columns_3': para apresentar 3 pilares ou tópicos principais.
- 'timeline_horizontal': para cronogramas ou planos sequenciais.
- 'quote_testimonial': para mensagens fortes de impacto.
- 'feature_split': para destacar capacidades técnicas.

Seja conciso, sofisticado e evite textos genéricos longos.`;

    const { object } = await generateObject({
      model: nvidia("meta/llama-3.3-70b-instruct"),
      schema: PresentationDocSchema,
      system: systemPrompt,
      prompt: `Crie uma apresentação completa de alto impacto para o seguinte tema:\n\n${prompt}`
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Erro na rota de geração:", error);
    return NextResponse.json(
      { error: error?.message || "Falha ao gerar apresentação com NVIDIA NIM." },
      { status: 500 }
    );
  }
}
