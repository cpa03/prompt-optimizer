FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@0.31.0 && corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/ui/package.json ./packages/ui/
COPY packages/web/package.json ./packages/web/
COPY packages/mcp-server/package.json ./packages/mcp-server/
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS build
COPY . /app
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/core/node_modules /app/packages/core/node_modules
COPY --from=deps /app/packages/ui/node_modules /app/packages/ui/node_modules
COPY --from=deps /app/packages/web/node_modules /app/packages/web/node_modules
COPY --from=deps /app/packages/mcp-server/node_modules /app/packages/mcp-server/node_modules
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build
RUN pnpm mcp:build

FROM nginx:stable-alpine

LABEL org.opencontainers.image.source="https://github.com/linshenkx/prompt-optimizer"
LABEL org.opencontainers.image.description="Prompt Optimizer - AI prompt optimization tool"
LABEL org.opencontainers.image.licenses="AGPL-3.0-only"
LABEL org.opencontainers.image.title="Prompt Optimizer"
LABEL org.opencontainers.image.vendor="Prompt Optimizer Team"
LABEL org.opencontainers.image.documentation="https://github.com/linshenkx/prompt-optimizer#readme"
LABEL org.opencontainers.image.maintainer="Prompt Optimizer Team"
ARG VERSION="unknown"
LABEL org.opencontainers.image.version="${VERSION}"

RUN apk add --no-cache apache2-utils dos2unix supervisor nodejs gettext curl && \
    curl -fsSL https://get.pnpm.io/install.sh | sh - && \
    ln -s /root/.local/share/pnpm/pnpm /usr/local/bin/pnpm

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 复制Web应用
COPY --from=build /app/packages/web/dist /usr/share/nginx/html

# 复制MCP服务器
COPY --from=build /app/packages/mcp-server/dist /app/mcp-server/dist
COPY --from=build /app/packages/mcp-server/package.json /app/mcp-server/
COPY --from=build /app/packages/mcp-server/preload-env.js /app/mcp-server/
COPY --from=build /app/packages/mcp-server/preload-env.cjs /app/mcp-server/

# 复制构建后的包到正确位置（MCP服务器依赖）
COPY --from=build /app/packages /app/packages
# 复制必要的node_modules
COPY --from=build /app/node_modules /app/node_modules

# 设置默认环境变量（向前兼容）
ENV NGINX_PORT=80

# 设置MCP服务器工作目录
WORKDIR /app/mcp-server

COPY docker/generate-config.sh /docker-entrypoint.d/40-generate-config.sh
COPY docker/generate-auth.sh /docker-entrypoint.d/30-generate-auth.sh
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/start-services.sh /start-services.sh

RUN chmod +x /docker-entrypoint.d/40-generate-config.sh \
    /docker-entrypoint.d/30-generate-auth.sh \
    /start-services.sh && \
    dos2unix /docker-entrypoint.d/40-generate-config.sh \
    /docker-entrypoint.d/30-generate-auth.sh \
    /start-services.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl --fail --silent --max-time 5 http://localhost:${NGINX_PORT:-80}/ > /dev/null 2>&1 && \
        curl --fail --silent --max-time 5 http://localhost:${NGINX_PORT:-80}/mcp > /dev/null 2>&1 || exit 1

# 使用自定义启动脚本
CMD ["sh", "/start-services.sh"]