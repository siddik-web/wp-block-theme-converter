#!/usr/bin/env bash
# build-skill.sh
#
# Packages the wp-block-theme-converter skill as a distributable .skill artifact
# (a zip file), suitable for sharing or importing into Claude.
#
# Usage:
#   bash scripts/build-skill.sh             # build the .skill zip
#   bash scripts/build-skill.sh --dry-run   # list what would be included, no zip created
#
# Output:
#   wp-block-theme-converter-v<VERSION>.skill  (zip archive)
#   wp-block-theme-converter-latest.skill      (copy of the above)
#
# Requirements: bash, zip, grep, sed, cp, mkdir, rm (standard GNU coreutils)

set -euo pipefail

# ─── Flags ───────────────────────────────────────────────────────────────────

DRY_RUN=0
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=1
  fi
done

# ─── Resolve repo root ────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

# ─── Read version from SKILL.md frontmatter ──────────────────────────────────

VERSION="$(grep '^version:' SKILL.md | sed 's/^version:[[:space:]]*//' | tr -d '[:space:]' || true)"

if [[ -z "${VERSION}" ]]; then
  echo "ERROR: Could not read 'version:' from SKILL.md frontmatter." >&2
  echo "       Add a line like:  version: 3.0.0" >&2
  exit 1
fi

ARTIFACT_NAME="wp-block-theme-converter-v${VERSION}.skill"
LATEST_NAME="wp-block-theme-converter-latest.skill"

echo "Building skill artifact: ${ARTIFACT_NAME}"
echo "Version: ${VERSION}"
echo "Source:  ${REPO_ROOT}"
echo ""

# ─── Collect files to include ────────────────────────────────────────────────
#
# Include everything EXCEPT:
#   .git/
#   node_modules/
#   .github/workflows/   (keep .github/PULL_REQUEST_TEMPLATE.md and other templates)
#   *.sh                 (the build scripts themselves)
#   *.skill              (previously built artifacts)

mapfile -t ALL_FILES < <(
  find . \
    -not -path './.git/*' \
    -not -path './node_modules/*' \
    -not -path './.github/workflows/*' \
    -not -name '*.sh' \
    -not -name '*.skill' \
    -type f \
  | sort
)

# Strip leading ./
FILES=()
for f in "${ALL_FILES[@]}"; do
  FILES+=("${f#./}")
done

echo "Files to include (${#FILES[@]} total):"
for f in "${FILES[@]}"; do
  echo "  ${f}"
done
echo ""

# ─── Dry-run exit ────────────────────────────────────────────────────────────

if [[ "${DRY_RUN}" -eq 1 ]]; then
  echo "[dry-run] Would create: ${REPO_ROOT}/${ARTIFACT_NAME}"
  echo "[dry-run] Would create: ${REPO_ROOT}/${LATEST_NAME}"
  echo "[dry-run] No files written."
  exit 0
fi

# ─── Build in temp dir ───────────────────────────────────────────────────────

TMPDIR="$(mktemp -d)"
trap 'rm -rf "${TMPDIR}"' EXIT

STAGE="${TMPDIR}/wp-block-theme-converter"
mkdir -p "${STAGE}"

for f in "${FILES[@]}"; do
  dest="${STAGE}/${f}"
  dest_dir="$(dirname "${dest}")"
  mkdir -p "${dest_dir}"
  cp "${REPO_ROOT}/${f}" "${dest}"
done

# ─── Create zip ──────────────────────────────────────────────────────────────

OUT="${REPO_ROOT}/${ARTIFACT_NAME}"
LATEST="${REPO_ROOT}/${LATEST_NAME}"

(
  cd "${TMPDIR}"
  zip -r "${OUT}" "wp-block-theme-converter" --quiet
)

cp "${OUT}" "${LATEST}"

# ─── Report ──────────────────────────────────────────────────────────────────

SIZE="$(du -sh "${OUT}" | cut -f1)"

echo "Build complete."
echo ""
echo "  Artifact:  ${OUT}"
echo "  Latest:    ${LATEST}"
echo "  Size:      ${SIZE}"
echo "  Files:     ${#FILES[@]}"
