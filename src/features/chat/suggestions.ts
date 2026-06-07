export interface Suggestion {
  text: string;
  category: "obras" | "contratos" | "fornecedores" | "risco";
}

export const SUGGESTIONS: Suggestion[] = [
  { text: "Quais obras têm aditivos acima de 20%?", category: "contratos" },
  { text: "Obras paralisadas em 2024?", category: "obras" },
  { text: "Fornecedores com maior taxa de risco histórico?", category: "fornecedores" },
  { text: "Obras com maior probabilidade de atraso este mês?", category: "risco" },
  { text: "Contratos com maior valor total contratado?", category: "contratos" },
  { text: "Quais secretarias concentram mais obras atrasadas?", category: "obras" },
  { text: "Listar obras sem execução registrada nos últimos 30 dias.", category: "obras" },
  { text: "Qual o fornecedor com mais contratos em andamento?", category: "fornecedores" },
];

export const CATEGORY_ICON: Record<Suggestion["category"], string> = {
  obras: "◉",
  contratos: "◈",
  fornecedores: "◎",
  risco: "⚠",
};
