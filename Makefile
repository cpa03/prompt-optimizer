.PHONY: help install build dev test lint clean docker docker-dev k8s-deploy k8s-destroy

help:
	@echo "Prompt Optimizer - DevOps Commands"
	@echo "=================================="
	@echo ""
	@echo "Development:"
	@echo "  install       Install dependencies"
	@echo "  build         Build all packages"
	@echo "  dev           Start development server"
	@echo "  test          Run all tests"
	@echo "  lint          Run linting"
	@echo "  clean         Clean build artifacts"
	@echo ""
	@echo "Docker:"
	@echo "  docker        Build and run Docker container (production)"
	@echo "  docker-dev    Build and run Docker container (development)"
	@echo "  docker-stop   Stop Docker containers"
	@echo "  docker-logs   View Docker logs"
	@echo ""
	@echo "Kubernetes:"
	@echo "  k8s-deploy    Deploy to Kubernetes cluster"
	@echo "  k8s-destroy   Remove Kubernetes deployment"
	@echo "  k8s-status    Check Kubernetes deployment status"
	@echo ""
	@echo "Desktop:"
	@echo "  build-desktop Build desktop application"
	@echo ""

install:
	pnpm install

build:
	pnpm build

dev:
	pnpm dev

test:
	pnpm test:fast

lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

type-check:
	pnpm type-check

clean:
	pnpm clean

docker:
	docker-compose up -d --build

docker-dev:
	docker-compose -f docker-compose.dev.yml up -d --build

docker-stop:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

docker-logs:
	docker-compose logs -f

docker-logs-dev:
	docker-compose -f docker-compose.dev.yml logs -f

k8s-deploy:
	kubectl apply -f k8s/deployment.yaml

k8s-destroy:
	kubectl delete -f k8s/deployment.yaml

k8s-status:
	kubectl get all -n prompt-optimizer

k8s-logs:
	kubectl logs -f deployment/prompt-optimizer -n prompt-optimizer

k8s-pods:
	kubectl get pods -n prompt-optimizer

build-desktop:
	pnpm build:desktop

mcp-build:
	pnpm mcp:build

mcp-dev:
	pnpm mcp:dev

mcp-start:
	pnpm mcp:start

format:
	pnpm format

format-check:
	pnpm format:check

version-sync:
	pnpm version:sync

bmad-refresh:
	pnpm bmad:refresh

bmad-validate:
	pnpm bmad:validate
