import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.js",
  output: {
    file: "dist/game.js",
    format: "umd",
    name: "Game",
  },
  plugins: [terser()],
};
