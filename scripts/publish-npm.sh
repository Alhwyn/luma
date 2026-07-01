#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! npm whoami --registry https://registry.npmjs.org >/dev/null 2>&1; then
  echo "Not logged in to npm. Run: npm login --auth-type=web"
  exit 1
fi

account="$(npm whoami --registry https://registry.npmjs.org)"
if [ "$account" != "alhwyn" ]; then
  echo "Logged in as '$account', expected 'alhwyn' to publish @alhwyn/luma"
  exit 1
fi

npm publish --access public --registry https://registry.npmjs.org
