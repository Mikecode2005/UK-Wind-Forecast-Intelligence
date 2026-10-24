# Wind Forecast Intelligence — one-command helpers for customers and reviewers.
#
#   make up          # start backend + frontend with Docker Compose
#   make down        # stop services
#   make test-backend# run the FastAPI test suite (mocked, no network)
#   make test-frontend# run the React test suite
#   make build       # build both Docker images
#   make logs        # tail backend logs

.PHONY: up down test-backend test-frontend build logs help

BACKEND_DIR = backend
FRONTEND_DIR = frontend

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

up: ## Start backend (8000) and frontend (5173) with Docker Compose
	docker compose up --build

down: ## Stop and remove Compose services
	docker compose down

test-backend: ## Run backend tests (11 tests, mocked — no network)
	cd $(BACKEND_DIR) && python -m pytest tests/ -q

test-frontend: ## Run frontend tests
	cd $(FRONTEND_DIR) && npx vitest run

build: ## Build Docker images without starting
	docker compose build

logs: ## Follow backend logs
	docker compose logs -f backend
