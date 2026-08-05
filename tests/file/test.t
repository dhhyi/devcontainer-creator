Generate file fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Build Dockerfile and encoded selftest are generated:

  $ jq -r '.build.dockerfile' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  Dockerfile
  $ jq -r '.containerEnv.DCC_SELFTEST | length > 0' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  true
  $ grep '"/usr/local/bin/testme"' "$CRAMTMP/out/.devcontainer/Dockerfile"
  RUN mkdir -p "/usr/local/bin" && echo "ZWNobyAnSGVsbG8gV29ybGQhJw==" | base64 -d > "/usr/local/bin/testme" && chmod +rx "/usr/local/bin/testme"
  $ grep '"${HOME}/.config/test/test.file"' "$CRAMTMP/out/.devcontainer/Dockerfile"
  RUN mkdir -p "${HOME}/.config/test" && echo "RU1QVFk=" | base64 -d > "${HOME}/.config/test/test.file" && chmod +r "${HOME}/.config/test/test.file"
