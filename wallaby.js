module.exports = () => {
  return {
    files: ["src/**/*.js", "sibylline.js"],
    tests: ["test/**/*.js"],
    testFramework: "mocha",
    env: {
      type: "node"
    },
    debug: true
  };
};
