FROM node:20-bookworm-slim AS base

# Instala ffmpeg, python3 (necessário para o yt-dlp) e curl
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instala a versão mais recente do yt-dlp globalmente
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Copia os arquivos de dependência do projeto
COPY package.json package-lock.json* ./

# Instala as dependências (incluindo devDependencies para compilação do TS)
RUN npm ci

# Copia o código fonte do servidor
COPY . .

# Compila o projeto TypeScript
RUN npm run build

# Configuração de produção
ENV NODE_ENV=production
ENV PORT=3000

# Expõe a porta
EXPOSE 3000

# Executa o servidor compilado
CMD ["npm", "start"]
