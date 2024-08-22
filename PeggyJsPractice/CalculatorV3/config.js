module.exports = {
    format: "es",
    input: "./PeggyJsPractice/CalculatorV3/parserV3.pegjs",
    dependencies: {
      'nodes': "./PeggyJsPractice/CalculatorV3/nodes.js"
    }
  };

  // Generate translator with the following command: npx peggy -c ./PeggyJsPractice/CalculatorV3/config.js