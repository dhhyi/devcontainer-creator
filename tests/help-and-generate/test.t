Basic help line is available:

  $ $DCC_EXEC -h 2>&1 | grep '^Usage:'
  Usage: node bundle.js language-spec [target-folder] [options]

Can generate devcontainer files in temporary folder:

  $ $DCC_EXEC dcc://javascript "$CRAMTMP/out" > /dev/null
  $ test -f "$CRAMTMP/out/.devcontainer/devcontainer.json"
  $ test -f "$CRAMTMP/out/.update_devcontainer.sh"
