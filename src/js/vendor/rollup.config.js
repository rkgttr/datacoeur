import npm from "rollup-plugin-node-resolve";

export default {
  entry: "index.js",
  plugins: [npm({jsnext: true})],
  moduleId: "d3",
  moduleName: "d3",
  format: "umd"
};
