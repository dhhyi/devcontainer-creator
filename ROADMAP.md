# Roadmap

## chown $HOME/.local takes too long

This should be an optional step that can be activated via extras. I doubt that it is a common problem.
Maybe start by removing it entirely and adding it back when needed.

## add a --push-cache

Currently --cache-to is only used when --push. But pushing an image might not be always desired when pushing the cache is enough. --push should imply --push-cache, but not the other way around.
