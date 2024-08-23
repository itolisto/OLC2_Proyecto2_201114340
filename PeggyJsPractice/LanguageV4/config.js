module.exports = {
    format: "es",
    input: "./CalculatorV3/parserV3.pegjs",
    dependencies: {
      'nodes': "./nodes.js"
    }
  };

  // Generate translator with the following command: npx peggy -c ./CalculatorV3/config.js