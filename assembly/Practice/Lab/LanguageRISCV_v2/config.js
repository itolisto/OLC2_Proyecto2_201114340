module.exports = {
    format: "es",
    input: "./RISCV_v2.pegjs",
    dependencies: {
      'nodes': "./nodes.js"
    }
  };

  // Generate translator with the following command: npx peggy -c ./LanguageV6/config.js