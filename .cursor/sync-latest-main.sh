#!/usr/bin/env bash
# Cloud Agent / スナップショット起動時に default branch の最新を取り込む。
# プレビルド Build は gitSetup=reuse のため、作業ツリーが remote より古いことがある。
# 古い .agent/feature_list.json を読むと完了済みタスクに再着手する。
set -euo pipefail

REMOTE="${CLOUD_SYNC_REMOTE:-origin}"
DEFAULT_BRANCH="${CLOUD_SYNC_DEFAULT_BRANCH:-main}"
LOG="${CLOUD_SYNC_LOG:-/tmp/cursor/sync-latest-main.log}"

mkdir -p "$(dirname "$LOG")"

log() {
  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG"
}

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  log "skip: remote '${REMOTE}' が無い"
  exit 0
fi

delay=4
fetch_ok=0
for _attempt in 1 2 3 4; do
  if git fetch --prune "$REMOTE" "$DEFAULT_BRANCH"; then
    fetch_ok=1
    break
  fi
  log "warn: git fetch 失敗。${delay}s 後に再試行"
  sleep "$delay"
  delay=$((delay * 2))
done

if [ "$fetch_ok" -ne 1 ]; then
  log "warn: git fetch を諦めました。作業ツリーは更新していません"
  exit 0
fi

REMOTE_REF="${REMOTE}/${DEFAULT_BRANCH}"
if ! git rev-parse --verify --quiet "$REMOTE_REF" >/dev/null; then
  log "skip: ${REMOTE_REF} が無い"
  exit 0
fi

REMOTE_SHA="$(git rev-parse "$REMOTE_REF")"
HEAD_SHA="$(git rev-parse HEAD)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
DIRTY="$(git status --porcelain)"

if [ -n "$DIRTY" ]; then
  log "skip checkout: 作業ツリーが dirty。fetch のみ (${REMOTE_REF}=${REMOTE_SHA})"
  exit 0
fi

if [ "$HEAD_SHA" = "$REMOTE_SHA" ]; then
  log "already latest: ${BRANCH} @ ${HEAD_SHA}"
  exit 0
fi

should_apply=0
if [ "$BRANCH" = "$DEFAULT_BRANCH" ]; then
  should_apply=1
elif [ "$BRANCH" = "HEAD" ] && git merge-base --is-ancestor HEAD "$REMOTE_REF"; then
  # デタッチ + 古い main 相当。Build の reuse checkout を想定する。
  should_apply=1
fi

if [ "$should_apply" -ne 1 ]; then
  log "skip checkout: ブランチ ${BRANCH} を維持。${REMOTE_REF}=${REMOTE_SHA}"
  exit 0
fi

OLD_LOCK="$(git rev-parse HEAD:pnpm-lock.yaml 2>/dev/null || true)"
git checkout -B "$DEFAULT_BRANCH" "$REMOTE_REF"
NEW_SHA="$(git rev-parse HEAD)"
NEW_LOCK="$(git rev-parse HEAD:pnpm-lock.yaml 2>/dev/null || true)"
log "fast-forward: ${HEAD_SHA} -> ${NEW_SHA} (${DEFAULT_BRANCH})"

if [ -n "$OLD_LOCK" ] && [ -n "$NEW_LOCK" ] && [ "$OLD_LOCK" != "$NEW_LOCK" ]; then
  log "pnpm-lock.yaml が変わったので pnpm install を実行"
  pnpm install
fi
