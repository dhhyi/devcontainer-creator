#!/bin/sh -ex
ghcup --version
ghc --version
cat > /tmp/helloworld.hs <<EOF
main = putStrLn "Hello World!"
EOF
runhaskell /tmp/helloworld.hs
