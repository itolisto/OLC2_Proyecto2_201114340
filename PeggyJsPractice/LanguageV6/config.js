module.exports = {
    format: "es",
    input: "./LanguageV6/parserV6.pegjs",
    dependencies: {
      'nodes': "./nodes.js"
    }
  };

  // Generate translator with the following command: npx peggy -c ./LanguageV6/config.js