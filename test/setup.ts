// Matchers do jest-dom + limpeza do DOM entre testes.
// O DOM já foi registrado pelo preload anterior (happydom.ts).
import { afterEach, expect } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
