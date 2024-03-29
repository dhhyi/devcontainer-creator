#!/bin/sh -e

if [ -z "$CI" ]; then
    npm exec pnpm -- i --prod --ignore-scripts
    npm exec pnpm run build
fi

find tests -name 'test.dcc' | while read -r test; do
    echo "Running $test"
    node dist/bundle.js "$(head -n 1 "$test")" "$(dirname "$test")" --test --dump-meta
done

find tests -name 'language.yaml' | while read -r test; do
    echo "Running $test"

    args=""
    if [ -f "$(dirname "$test")/test-args.dcc" ]; then
        args="$(head -n 1 "$(dirname "$test")/test-args.dcc")"
    fi
    # shellcheck disable=SC2086
    node dist/bundle.js "$test" "$(dirname "$test")" --test --dump-meta $args
done

if [ -n "$(git status -s)" ]; then
    echo "tree is dirty, please commit changes"
    git status -s
    exit 1
fi
