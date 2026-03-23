module.exports = function(eleventyConfig) {
  // Listen on all interfaces so WSL2 port proxy can reach the server
  eleventyConfig.setServerOptions({
    host: "0.0.0.0",
  });

  // Copy assets folder to output
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");

  // Shortcode for current year
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
    pathPrefix: process.env.ELEVENTY_PREFIX || "/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
