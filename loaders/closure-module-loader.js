module.exports = function closureModuleLoader(source) {
  const { globals, exportExpression } = this.getOptions();
  const declarations = Object.entries(globals)
    .map(([name, expression]) => `var ${name} = ${expression};`)
    .join("\n");

  return `module.exports = (function () {
${declarations}
${source}
return ${exportExpression};
}).call(globalThis);`;
};
