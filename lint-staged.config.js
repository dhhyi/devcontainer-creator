module.exports = {
  "*": ["prettier --write", () => "node check-lang-ci.js"],
  "*.{mjs,js}": ["eslint --fix"],
};
