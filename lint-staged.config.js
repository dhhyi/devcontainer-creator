module.exports = {
  "*": ["prettier --write"],
  "*.{mjs,js}": ["eslint --fix"],
  "features/**": [() => "devcontainer features test features"],
};
