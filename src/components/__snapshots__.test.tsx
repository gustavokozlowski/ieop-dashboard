import { describe, expect, it } from "bun:test";
import { render } from "@testing-library/react";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { LoadingSpinner } from "./LoadingSpinner";

// Snapshot tests dos componentes de apresentação principais.
describe("snapshots", () => {
  it("Badge (danger)", () => {
    const { container } = render(<Badge variant="danger" />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("Card (com tendência)", () => {
    const { container } = render(
      <Card title="Alunos ativos" value="1.284" trend={12} trendLabel="vs. mês anterior" />,
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("LoadingSpinner (lg)", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    expect(container.innerHTML).toMatchSnapshot();
  });
});
