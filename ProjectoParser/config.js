module.exports = {
    format: "es",
    input: "./oakland.pegjs",
    dependencies: {
      'node': "./node.js"
    }
  };

  // Generate translator with the following command: npx peggy -c ./config.js