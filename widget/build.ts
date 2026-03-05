import * as esbuild from "esbuild";

esbuild.buildSync({
  entryPoints: ["widget/src/widget.ts"],
  bundle: true,
  minify: true,
  outfile: "public/widget.js",
  format: "iife",
  target: "es2020",
});

console.log("Widget built to public/widget.js");
