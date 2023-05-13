module.exports = function(eleventyConfig) {
  eleventyConfig.addWatchTarget('./src/**/*.js');

  return {
    // .md files can use njk templating
    markdownTemplateEngine: 'njk'
  };
};
