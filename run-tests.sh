#!/bin/sh -e

if [ -z "$CI" ]; then
    npm exec pnpm -- i --prod --ignore-scripts
    npm exec pnpm run build
fi

if [ -z "$*" ]; then
    set -- tests
fi

filter() {
    if [ -z "$1" ]; then
        echo "No test provided"
        exit 0
    fi

    test="$1"
    shift

    for filter in "$@"; do
        if expr "$test" : ".*$filter.*" > /dev/null 2>&1; then
            return 0
        fi
    done
    return 1
}

find tests -name 'test.dcc' | while read -r test; do
    if filter "$test" "$@"; then
        echo "Running $test"
        node dist/bundle.js "$(head -n 1 "$test")" "$(dirname "$test")" --test --dump-meta
    fi
done

find tests -name 'language.yaml' | while read -r test; do

    args=""
    if [ -f "$(dirname "$test")/test-args.dcc" ]; then
        args="$(head -n 1 "$(dirname "$test")/test-args.dcc")"
    fi
    if filter "$test" "$@"; then
        echo "Running $test"
        # shellcheck disable=SC2086
        node dist/bundle.js "$test" "$(dirname "$test")" --test --dump-meta $args
    fi
done

if git status --porcelain | grep -v .devcontainer_meta.json; then
    echo "tree is dirty, please commit changes"
    git status --porcelain
    exit 1
fi
