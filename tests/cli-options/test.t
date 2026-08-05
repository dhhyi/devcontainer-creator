Name override is applied:

  $ $DCC_EXEC dcc://javascript "$CRAMTMP/out" --name "My Custom Name" > /dev/null

Generated devcontainer name and update script include --name:

  $ jq -r '.name' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  My Custom Name
  $ grep -F -- '--name "My Custom Name"' "$CRAMTMP/out/.update_devcontainer.sh"
  curl -so- https://raw.githubusercontent.com/dhhyi/devcontainer-creator/dist/bundle.js | node - dcc://javascript . --name "My Custom Name" "$@"

Unknown option exits with usage:

  $ $DCC_EXEC dcc://javascript "$CRAMTMP/out-unknown" --badoption > "$CRAMTMP/unknown.log" 2>&1
  [1]
  $ grep '^Unknown option: badoption$' "$CRAMTMP/unknown.log"
  Unknown option: badoption
  $ grep '^Usage:' "$CRAMTMP/unknown.log"
  Usage: node bundle.js language-spec [target-folder] [options]

Missing language spec exits with usage:

  $ $DCC_EXEC > "$CRAMTMP/no-args.log" 2>&1
  [1]
  $ grep '^Usage:' "$CRAMTMP/no-args.log"
  Usage: node bundle.js language-spec [target-folder] [options]

Help includes --dump-meta option:

  $ $DCC_EXEC -h > "$CRAMTMP/help.log" 2>&1
  [1]
  $ grep -q -- '--dump-meta' "$CRAMTMP/help.log"
