import { describe, expect, it, mock } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type Column, Table } from "./Table";

interface Row extends Record<string, unknown> {
  nome: string;
  valor: number;
}

const DATA: Row[] = [
  { nome: "Bravo", valor: 30 },
  { nome: "Alfa", valor: 10 },
  { nome: "Charlie", valor: 20 },
];

const COLUMNS: Column<Row>[] = [
  { key: "nome", header: "Nome", sortable: true },
  { key: "valor", header: "Valor", sortable: true },
];

function bodyRowsText() {
  const rows = screen.getAllByRole("row").slice(1); // pula o header
  return rows.map((r) => within(r).getAllByRole("cell")[0]?.textContent);
}

describe("Table", () => {
  it("renderiza todas as linhas", () => {
    render(<Table columns={COLUMNS} data={DATA} />);
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("Alfa")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("filtra pela busca", async () => {
    const user = userEvent.setup();
    render(<Table columns={COLUMNS} data={DATA} />);
    await user.type(screen.getByLabelText("Buscar na tabela"), "alf");
    expect(screen.getByText("Alfa")).toBeInTheDocument();
    expect(screen.queryByText("Bravo")).not.toBeInTheDocument();
  });

  it("ordena ao clicar no cabeçalho", async () => {
    const user = userEvent.setup();
    render(<Table columns={COLUMNS} data={DATA} searchable={false} />);
    await user.click(screen.getByText("Nome"));
    expect(bodyRowsText()).toEqual(["Alfa", "Bravo", "Charlie"]);
    await user.click(screen.getByText("Nome")); // inverte
    expect(bodyRowsText()).toEqual(["Charlie", "Bravo", "Alfa"]);
  });

  it("pagina quando excede pageSize", async () => {
    const user = userEvent.setup();
    render(<Table columns={COLUMNS} data={DATA} pageSize={2} searchable={false} />);
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3); // header + 2
    await user.click(screen.getByLabelText("Próxima página"));
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
  });

  it("dispara onRowClick com a linha clicada", async () => {
    const user = userEvent.setup();
    const onRowClick = mock(() => {});
    render(<Table columns={COLUMNS} data={DATA} searchable={false} onRowClick={onRowClick} />);
    await user.click(screen.getByText("Bravo"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0]?.[0]).toMatchObject({ nome: "Bravo", valor: 30 });
  });

  it("mostra mensagem de vazio", () => {
    render(<Table columns={COLUMNS} data={[]} emptyMessage="Nada aqui" />);
    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
  });
});
