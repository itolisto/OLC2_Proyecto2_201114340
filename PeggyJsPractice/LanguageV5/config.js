module.exports = {
    format: "es",
    input: "./LanguageV5/parserV5.pegjs",
    dependencies: {
      'nodes': "./nodes.js"
    }
  };

  // Generate translator with the following command: npx peggy -c ./LanguageV5/config.js