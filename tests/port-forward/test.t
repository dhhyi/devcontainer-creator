Generate port-forward fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Forwarded ports appear in config and Dockerfile expose list:

  $ jq -r '.forwardPorts | join(",")' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  80,8080
  $ grep '^EXPOSE 80 8080$' "$CRAMTMP/out/.devcontainer/Dockerfile"
  EXPOSE 80 8080
