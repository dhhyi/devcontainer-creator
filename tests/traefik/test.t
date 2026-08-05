Generate traefik fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Traefik labels, network, and exposed port are configured:

  $ jq '{forwardPorts, runArgs}' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  {
    "forwardPorts": [
      3000
    ],
    "runArgs": [
      "--label",
      "traefik.enable=true",
      "--label",
      "traefik.http.routers.json-data.rule=PathPrefix(`/data`)",
      "--label",
      "traefik.http.routers.json-data.entrypoints=web",
      "--label",
      "traefik.http.routers.json-data.middlewares=json-data-stripprefix",
      "--label",
      "traefik.http.middlewares.json-data-stripprefix.stripprefix.prefixes=/data",
      "--network",
      "intranet"
    ]
  }
  $ grep '^EXPOSE 3000$' "$CRAMTMP/out/.devcontainer/Dockerfile"
  EXPOSE 3000
