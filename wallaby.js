module.exports = () => {
  return {
    files: ["sibylline.js"],
    tests: ["test/**/*.js"],
    testFramework: "mocha",
    env: {
      type: "node"
    },
    debug: true
  };
};
