# IEOP frontend (Bun). Serve src/index.html via Bun.serve em :3000.
# O cliente usa /proxy (mesma origem); o servidor encaminha /proxy/* para o
# backend em BUN_PUBLIC_API_URL (default http://localhost:8000).
FROM oven/bun:1.3.8

WORKDIR /app

# Dependências primeiro (cache de camada)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Código
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "src/index.ts"]
