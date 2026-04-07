.DEFAULT_GOAL := help

# 检查 pnpm 是否安装
PNPM := $(shell command -v pnpm 2> /dev/null)
ifeq ($(strip $(PNPM)),)
$(error pnpm is not installed. Please install pnpm first)
endif

NPM := $(shell command -v npm 2> /dev/null)
ifeq ($(strip $(NPM)),)
$(error npm is not installed. Please install npm first)
endif

help:
	@echo "Common commands:"
	@echo "  make ps      # list pending changesets"
	@echo "  make new     # create a changeset (optional)"
	@echo "  make build   # compile cli and copy templates/assets"
	@echo "  make test    # run all tests"
	@echo "  make check   # run release checks"
	@echo "  make up      # bump version from pending changesets if any"
	@echo "  make dry     # dry-run publish"
	@echo "  make pub     # publish"
	@echo "  make push    # publish, commit release files, and push tag"
	@echo ""
	@echo "Recommended release flow:"
	@echo "  make new     # optional, only if you want release notes"
	@echo "  make dry     # optional but recommended"
	@echo "  make pub"

new:
	@$(PNPM) exec changeset

ps:
	@files=$$(find .changeset -maxdepth 1 -type f -name '*.md' ! -name 'README.md' | sort); \
		if [ -z "$$files" ]; then \
			echo "No pending changesets."; \
			exit 0; \
		fi; \
		echo "Pending changesets:"; \
		for file in $$files; do echo "- $$file"; done

build:
	@$(PNPM) exec tsc -d --outDir dist
	@rm -rf dist/templates dist/assets
	@if [ -d src/templates ]; then mkdir -p dist/templates && cp -R src/templates/. dist/templates/; fi
	@if [ -d src/assets ]; then mkdir -p dist/assets && cp -R src/assets/. dist/assets/; fi
	@if [ -f dist/index.js ]; then chmod +x dist/index.js; fi
	@echo "Build completed."

typecheck:
	@$(PNPM) exec tsc --noEmit

test:
	@$(MAKE) build
	@files=$$(find tests -type f -name '*.test.mjs' | sort); \
		if [ -z "$$files" ]; then \
			echo "No test files found."; \
			exit 0; \
		fi; \
		node --test $$files

test-unit:
	@$(MAKE) build
	@files=$$(find tests/unit -type f -name '*.test.mjs' | sort); \
		if [ -z "$$files" ]; then \
			echo "No unit tests found."; \
			exit 0; \
		fi; \
		node --test $$files

test-integration:
	@$(MAKE) build
	@files=$$(find tests/integration -type f -name '*.test.mjs' | sort); \
		if [ -z "$$files" ]; then \
			echo "No integration tests found."; \
			exit 0; \
		fi; \
		node --test $$files

check:
	@$(MAKE) typecheck
	@$(MAKE) test
	@test -f package.json || (echo "package.json not found"; exit 1)
	@test -f README.md || (echo "README.md not found"; exit 1)
	@test -d dist || (echo "dist directory not found"; exit 1)
	@test -f dist/index.js || (echo "dist/index.js not found"; exit 1)
	@test -x dist/index.js || (echo "dist/index.js is not executable"; exit 1)
	@echo "Release checks passed."

_require_cs:
	@files=$$(find .changeset -maxdepth 1 -type f -name '*.md' ! -name 'README.md' | sort); \
		if [ -z "$$files" ]; then \
			echo "No pending changesets found. Run 'make new' before 'make dry', 'make pub', or 'make push'."; \
			exit 1; \
		fi; \
		echo "Pending changesets:"; \
		for file in $$files; do echo "- $$file"; done

up:
	@files=$$(find .changeset -maxdepth 1 -type f -name '*.md' ! -name 'README.md' | sort); \
		if [ -z "$$files" ]; then \
			VERSION=$$($(PNPM) pkg get version | tr -d '"'); \
			echo "No pending changesets. Keeping version $$VERSION"; \
			exit 0; \
		fi; \
		$(PNPM) exec changeset version; \
		VERSION=$$($(PNPM) pkg get version | tr -d '"'); \
		echo "Updated package.json version to $$VERSION"

_commit:
	@echo "Committing release changes"
	@VERSION=$$($(PNPM) pkg get version | tr -d '"'); \
		git diff --quiet package.json .changeset pnpm-lock.yaml || \
		(git add package.json .changeset pnpm-lock.yaml && \
		git commit -m "release v$$VERSION" && \
		git push) || \
		(echo "Git commit failed"; exit 1)

_tag: _commit
	@VERSION=$$($(PNPM) pkg get version | tr -d '"'); \
		echo "Creating and pushing tag v$$VERSION"; \
		git tag v$$VERSION && \
		git push origin v$$VERSION || \
		(echo "Failed to create and push tag"; exit 1)

dev:
	@node dist/index.js

pub: up
	@$(MAKE) check
	@$(NPM) publish

dry: up
	@$(MAKE) check
	@$(NPM) publish --dry-run

push: pub _commit _tag

.PHONY: help new ps build typecheck test test-unit test-integration check up dry pub push dev _require_cs _commit _tag
