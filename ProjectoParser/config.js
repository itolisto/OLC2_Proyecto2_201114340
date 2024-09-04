module.exports = {
    format: "es",
    input: "./oakland.pegjs",
    dependencies: {
      'nodes': "./oaknode.js"
    }
  };

  /**
   *  Generate translator with the following command: npx peggy -c ./config.js or if you can generate a parser that is compatible with
   * javascript from peggy's website just enter your grammar and in  "Parser variable For CommonJS" enter "Window.peg", download 
   * the ES6 module, ES6 is the new module system
  */