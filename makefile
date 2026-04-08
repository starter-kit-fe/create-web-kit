PNPM := $(shell command -v pnpm 2> /dev/null)
ifeq ($(strip $(PNPM)),)
$(error pnpm is not installed. Please install pnpm first)
endif

NPM := $(shell command -v npm 2> /dev/null)
ifeq ($(strip $(NPM)),)
$(error npm is not installed. Please install npm first)
endif

dev:
	@$(MAKE) build
	@node dist/index.js

build:
	@$(PNPM) exec tsc -d --outDir dist
	@rm -rf dist/templates dist/assets
	@if [ -d src/templates ]; then mkdir -p dist/templates && cp -R src/templates/. dist/templates/; fi
	@if [ -d src/assets ]; then mkdir -p dist/assets && cp -R src/assets/. dist/assets/; fi
	@if [ -f dist/index.js ]; then chmod +x dist/index.js; fi
	@echo "Build completed."

lint:
	@$(PNPM) exec tsc --noEmit

check:
	@$(MAKE) lint
	@$(MAKE) build
	@files=$$(find tests -type f -name '*.test.mjs' | sort); \
		if [ -z "$$files" ]; then \
			echo "No test files found."; \
			exit 0; \
		fi; \
		node --test $$files
	@test -f package.json || (echo "package.json not found"; exit 1)
	@test -f README.md || (echo "README.md not found"; exit 1)
	@test -d dist || (echo "dist directory not found"; exit 1)
	@test -f dist/index.js || (echo "dist/index.js not found"; exit 1)
	@test -x dist/index.js || (echo "dist/index.js is not executable"; exit 1)
	@echo "Release checks passed."

deploy:
	@commit_message=$${MSG:-chore: prepare release}; \
		if [ -n "$$(git status --porcelain)" ]; then \
			git add -A && git commit -m "$$commit_message"; \
		else \
			echo "No working tree changes to commit before release."; \
		fi
	@previous_version=$$($(PNPM) pkg get version | tr -d '"'); \
		$(PNPM) exec changeset; \
		changesets=$$(find .changeset -maxdepth 1 -type f -name '*.md' ! -name 'README.md' | sort); \
		if [ -z "$$changesets" ]; then \
			echo "No pending changesets found. Deploy stopped."; \
			exit 1; \
		fi; \
		$(PNPM) exec changeset version; \
		next_version=$$($(PNPM) pkg get version | tr -d '"'); \
		if [ "$$previous_version" = "$$next_version" ]; then \
			echo "Version did not change after 'changeset version'. Deploy stopped."; \
			exit 1; \
		fi; \
		echo "Version updated: $$previous_version -> $$next_version"
	@$(PNPM) run check
	@release_message=$${RELEASE_MSG:-release v$$($(PNPM) pkg get version | tr -d '"')}; \
		if [ -z "$$(git status --porcelain)" ]; then \
			echo "No release artifacts to commit. Deploy stopped."; \
			exit 1; \
		fi; \
		git add -A && \
		git commit -m "$$release_message" && \
		git push && \
		$(NPM) publish

.PHONY: dev build lint check deploy
