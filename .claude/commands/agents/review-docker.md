# Docker & Infrastructure Review Agent

Review Docker configuration, compose orchestration, and deployment patterns in ClearSight.

## What to Check

### Dockerfile Efficiency
- Multi-stage builds minimize final image size
- Layer ordering optimizes cache hits (deps before source code)
- `COPY package.json pnpm-lock.yaml` before `COPY .` for dependency caching
- No unnecessary tools/packages in production images
- `.dockerignore` excludes node_modules, .git, docs, etc.
- Playwright/Chromium only installed in images that need it (worker, not app-only)

### Compose Configuration
- Health checks on all stateful services (postgres, redis)
- `depends_on` with `condition: service_healthy` for proper startup order
- Environment variables use `${VAR}` syntax with defaults where appropriate
- Volume mounts for dev (`.:/app`) with anonymous volume for node_modules
- Port mappings don't conflict
- Named volumes for persistent data (pgdata)

### Service Architecture
- Image reuse: services sharing the same Dockerfile use `image:` tag to build once
- Worker doesn't expose ports (no HTTP traffic)
- Bull Board is only in dev compose, not production
- Production compose uses standalone Next.js output

### Resource Management
- No memory limits set that are too low for Playwright (needs ~500MB+)
- Redis doesn't need persistence for job queues (ephemeral is fine)
- Postgres data persists via named volume

### Security
- No root user in containers (or documented reason if root)
- No secrets in docker-compose files (use env_file or env vars)
- Internal services (postgres, redis) not exposed to host in production

## Files to Focus On
- `Dockerfile` — Production build
- `Dockerfile.dev` — Dev build
- `Dockerfile.worker` — Worker build (if exists)
- `docker-compose.yml` — Production compose
- `docker-compose.dev.yml` — Dev compose
- `.dockerignore`

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
