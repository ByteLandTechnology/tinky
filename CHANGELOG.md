## [1.5.0](https://github.com/ByteLandTechnology/tinky/compare/v1.4.3...v1.5.0) (2026-02-11)

### ✨ Features

- export EventEmitter as value in index.ts ([055b4f3](https://github.com/ByteLandTechnology/tinky/commit/055b4f31794fbce437063f15e9204cd1f8532e81))

## [1.4.3](https://github.com/ByteLandTechnology/tinky/compare/v1.4.2...v1.4.3) (2026-02-03)

### 🔧 Chores

- **deps:** upgrade taffy-layout to v2.0.3 ([5d4f09a](https://github.com/ByteLandTechnology/tinky/commit/5d4f09a72208f1b328e9e4ed823f85f31c4b0c17))

## [1.4.2](https://github.com/ByteLandTechnology/tinky/compare/v1.4.1...v1.4.2) (2026-02-03)

### ♻️ Refactoring

- replace cli-boxes dependency with local implementation ([d29847e](https://github.com/ByteLandTechnology/tinky/commit/d29847eade9c286c2c6d3475e850ba71d0d16d18))

## [1.4.1](https://github.com/ByteLandTechnology/tinky/compare/v1.4.0...v1.4.1) (2026-01-21)

### 📚 Documentation

- add logo and standardise README headers ([01d9568](https://github.com/ByteLandTechnology/tinky/commit/01d956853648294e265a041358f3afd3eb318dda))

## [1.4.0](https://github.com/ByteLandTechnology/tinky/compare/v1.3.0...v1.4.0) (2026-01-20)

### ✨ Features

- **context:** add env to AppContext using RenderOptions ([233da66](https://github.com/ByteLandTechnology/tinky/commit/233da665f5cf22ba38bfb906299464128dd7a7ca))

### 🐛 Bug Fixes

- add missing .js extension to node-adapater import ([a22942b](https://github.com/ByteLandTechnology/tinky/commit/a22942bdeb4d2b19076afd9f897cd5fd79efaff5))
- rename node-adapater to node-adapter and update imports ([169a3bc](https://github.com/ByteLandTechnology/tinky/commit/169a3bc53fdf6bf047bdf1dd5f52262f7e3b1dba))
- replace util.format with JSON output in patchConsole for browser compatibility ([7fd0574](https://github.com/ByteLandTechnology/tinky/commit/7fd057446cfefa9e9cc2a90452cc011cf730d21c))

### ♻️ Refactoring

- replace ansi-escapes with local implementation ([e594079](https://github.com/ByteLandTechnology/tinky/commit/e5940797c36b16a6122e8d4fb7c9b98db44872bb))
- simplify error stack display and remove unused dependencies ([7589a2f](https://github.com/ByteLandTechnology/tinky/commit/7589a2fb6db98a32968f7cb22d063b943239bfbb))
- update parseKeypress to only accept string input ([02eebbc](https://github.com/ByteLandTechnology/tinky/commit/02eebbc51b75628ab2565aa9b4d852b6edc9be5c))

### 🔧 Chores

- upgrade taffy-layout to ^1.0.1 ([30f1dd3](https://github.com/ByteLandTechnology/tinky/commit/30f1dd38e2d189da9850d06fca3fe9495e69c987))

## [1.3.0](https://github.com/ByteLandTechnology/tinky/compare/v1.2.2...v1.3.0) (2026-01-19)

### ✨ Features

- add platform to AppProps and AppContext ([2e03e1c](https://github.com/ByteLandTechnology/tinky/commit/2e03e1c69e22cb1ad8ac4278a09359f7b3e25390))

## [1.2.2](https://github.com/ByteLandTechnology/tinky/compare/v1.2.1...v1.2.2) (2026-01-18)

### 📦 Build

- install conventional-changelog dependencies and fix changelog format ([62eedbc](https://github.com/ByteLandTechnology/tinky/commit/62eedbc8f722a4db5c814e9fde3e44c092bb2f86))

# [1.2.1](https://github.com/ByteLandTechnology/tinky/compare/v1.2.0...v1.2.1) (2026-01-18)

### 📦 Build

- fix semantic-release config and reformat changelog ([10427ba](https://github.com/ByteLandTechnology/tinky/commit/10427ba))

### ♻️ Refactoring

- replace chalk with ansis and update types ([e7415fc](https://github.com/ByteLandTechnology/tinky/commit/e7415fc))

# [1.2.0](https://github.com/ByteLandTechnology/tinky/compare/v1.1.2...v1.2.0) (2026-01-18)

### ✨ Features

- add Separator and refactor Text styling ([7ea3d03](https://github.com/ByteLandTechnology/tinky/commit/7ea3d03))

# [1.1.2](https://github.com/ByteLandTechnology/tinky/compare/v1.1.1...v1.1.2) (2026-01-18)

### ♻️ Refactoring

- **types:** simplify IO stream interfaces ([477a6ce](https://github.com/ByteLandTechnology/tinky/commit/477a6ce))

# [1.1.1](https://github.com/ByteLandTechnology/tinky/compare/v1.1.0...v1.1.1) (2026-01-18)

### 📦 Build

- enhance semantic-release configuration ([7b46092](https://github.com/ByteLandTechnology/tinky/commit/7b46092))

### ♻️ Refactoring

- remove Node.js dependencies for better portability ([7fcda48](https://github.com/ByteLandTechnology/tinky/commit/7fcda48))

# [1.1.0](https://github.com/ByteLandTechnology/tinky/compare/v1.0.0...v1.1.0) (2026-01-17)

### ✨ Features

- replace patch-console with internal implementation ([b9636a0](https://github.com/ByteLandTechnology/tinky/commit/b9636a05f9570ae8b654fc91b6521b8ad3bd3e8d))

# 1.0.0 (2026-01-16)

### ✨ Features

- implement Tinky - React for CLIs with Taffy layout engine ([34c82f7](https://github.com/ByteLandTechnology/tinky/commit/34c82f7a1f4f54386bcb98531ce7adcdbc430812))
- initial commit ([39873cc](https://github.com/ByteLandTechnology/tinky/commit/39873ccab2642c6ba48e9bc2b3b1d4919efa8989))
