Validation fails when extras includes traefik but traefik root config is missing:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > "$CRAMTMP/error.log" 2>&1
  [1]
  $ grep -q 'traefik root config must be defined' "$CRAMTMP/error.log"
