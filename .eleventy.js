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

  // Format author array [{family, given, self?}] → HTML string, self author highlighted
  eleventyConfig.addFilter("formatAuthors", function(authors) {
    if (!authors || !authors.length) return '';
    return authors.map(a => {
      const name = `${a.family}, ${a.given.charAt(0)}.`;
      return a.self ? `<span class="pub-author-self">${name}</span>` : name;
    }).join(', ');
  });

  // Filter publications array by type
  eleventyConfig.addFilter("pubsByType", function(pubs, type) {
    return (pubs || []).filter(p => p.type === type);
  });

  // Filter publications array by status (treats missing status as "published")
  eleventyConfig.addFilter("pubsByStatus", function(pubs, status) {
    if (status === "published") {
      return (pubs || []).filter(p => !p.status || p.status === "published");
    }
    return (pubs || []).filter(p => p.status === status);
  });

  // Human-readable label for publication type
  eleventyConfig.addFilter("typeLabel", function(type) {
    const labels = {
      journal: "Journal Articles",
      conference: "Conference Papers",
      book_chapter: "Book Chapters",
      book: "Books",
      misc: "Miscellaneous"
    };
    return labels[type] || type;
  });

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
