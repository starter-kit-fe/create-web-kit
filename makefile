# 检查 pnpm 是否安装
PNPM := $(shell command -v pnpm 2> /dev/null)
ifeq ($(strip $(PNPM)),)
$(error pnpm is not installed. Please install pnpm first)
endif

help:
	@echo "Common commands:"
	@echo "  make ps      # list pending changesets"
	@echo "  make add     # create a changeset"
	@echo "  make check   # run release checks"
	@echo "  make ver     # validate changesets and bump version"
	@echo "  make dry     # dry-run publish"
	@echo "  make pub     # publish and archive changesets"
	@echo "  make ship    # publish, commit release files, and push tag"
	@echo ""
	@echo "Compatibility aliases:"
	@echo "  make changeset changeset-status changeset-check update-version"
	@echo "  make dry-run publish release"

add:
	@$(PNPM) run changeset

ps:
	@$(PNPM) run changeset:status

check:
	@$(PNPM) run release:check

check-cs:
	@$(PNPM) run changeset:check

arc:
	@$(PNPM) run changeset:archive

ver: check-cs
	@$(PNPM) run release:version

commit-release:
	@echo "Committing release changes"
	@VERSION=$$($(PNPM) pkg get version | tr -d '"'); \
		git diff --quiet package.json .changeset pnpm-lock.yaml || \
		(git add package.json .changeset pnpm-lock.yaml && \
		git commit -m "release v$$VERSION" && \
		git push) || \
		(echo "Git commit failed"; exit 1)

tag: commit-release
	@VERSION=$$($(PNPM) pkg get version | tr -d '"'); \
		echo "Creating and pushing tag v$$VERSION"; \
		git tag v$$VERSION && \
		git push origin v$$VERSION || \
		(echo "Failed to create and push tag"; exit 1)

dev:
	@$(PNPM) run start

pub: ver
	@$(PNPM) run release:publish
	@$(PNPM) run changeset:archive

dry: ver
	@$(PNPM) run release:dry-run

ship: pub commit-release tag

changeset: add
changeset-status: ps
changeset-check: check-cs
archive-changesets: arc
update-version: ver
push-version: commit-release
push-tag: tag
publish: pub
dry-run: dry
release: ship

.PHONY: help add ps check check-cs arc ver commit-release tag dev pub dry ship changeset changeset-status changeset-check archive-changesets update-version push-version push-tag publish dry-run release
