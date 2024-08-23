module.exports = {
    format: "es",
    input: "./LanguageV4/parserV4.pegjs",
    dependencies: {
      'nodes': "./nodes.js"
    }
  };

  // Generate translator with the following command: npx peggy -c ./LanguageV4/config.js