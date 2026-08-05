Generate publish fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Publish cache reference and labels are generated:

  $ jq -r '.build.cacheFrom' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  type=registry,ref=dcc/test-image-name-cache
  $ grep '^LABEL "foo"="bar" "test"="dummy"$' "$CRAMTMP/out/.devcontainer/Dockerfile"
  LABEL "foo"="bar" "test"="dummy"
