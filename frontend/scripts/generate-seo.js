/**
 * Programmatic SEO Generator for First Step AI
 * 
 * Generates thousands of long-tail keyword pages through dimension combinations.
 * Run during CI/CD build: npm run generate-seo
 */

const fs = require('fs');
const path = require('path');

// Load dimensions
const dimensions = require('./dimensions.json');

const SITE_URL = 'https://first-step.demo.densematrix.ai';
const OUTPUT_DIR = path.join(__dirname, '../public/p');
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap-programmatic.xml');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate URL slug from text
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate all dimension combinations (Cartesian product)
 */
function generateCombinations(dimensions) {
  const keys = Object.keys(dimensions);
  const values = keys.map(k => dimensions[k]);
  
  function cartesian(arrays) {
    return arrays.reduce((acc, arr) => {
      return acc.flatMap(x => arr.map(y => [...x, y]));
    }, [[]]);
  }
  
  const combinations = cartesian(values);
  
  return combinations.map(combo => {
    const obj = {};
    keys.forEach((key, i) => {
      obj[key] = combo[i];
    });
    return obj;
  });
}

/**
 * Generate page content for a combination
 */
function generatePageContent(combo) {
  const title = `${combo.goal} ${combo.context} - First Step for ${combo.audience}`;
  const slug = slugify(`${combo.audience}-${combo.goal}-${combo.context}`);
  
  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | First Step AI</title>
  <meta name="description" content="Get the next step for ${combo.goal.toLowerCase()} as ${combo.audience.toLowerCase()} ${combo.context.toLowerCase()}. Free AI tool to break through overwhelm.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE_URL}/p/${slug}/">
  <meta property="og:title" content="${title} | First Step AI">
  <meta property="og:description" content="Get the next step for ${combo.goal.toLowerCase()} as ${combo.audience.toLowerCase()} ${combo.context.toLowerCase()}.">
  <meta property="og:url" content="${SITE_URL}/p/${slug}/">
  <meta property="og:type" content="website">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${title}",
    "description": "Get the next step for ${combo.goal.toLowerCase()} as ${combo.audience.toLowerCase()} ${combo.context.toLowerCase()}.",
    "url": "${SITE_URL}/p/${slug}/",
    "isPartOf": {"@type": "WebSite", "name": "First Step AI", "url": "${SITE_URL}"}
  }
  </script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    .cta { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
    .cta:hover { background: #059669; }
    .features { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .related { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .related a { color: #10b981; margin-right: 15px; }
  </style>
</head>
<body>
  <nav><a href="/">← Back to First Step AI</a></nav>
  
  <h1>${title}</h1>
  
  <p>Feeling overwhelmed about <strong>${combo.goal.toLowerCase()}</strong> ${combo.context.toLowerCase()}? 
  As ${combo.audience.toLowerCase()}, you don't need a complex plan—you need to know the <strong>ONE thing</strong> to do next.</p>
  
  <div class="features">
    <h3>How First Step AI Helps</h3>
    <ul>
      <li>Enter your goal: "${combo.goal}"</li>
      <li>Get exactly ONE concrete action</li>
      <li>Know how long it takes</li>
      <li>Clear completion criteria</li>
    </ul>
  </div>
  
  <p>Stop planning. Start doing. The first step is always the hardest—but also the most important.</p>
  
  <a href="/?task=${encodeURIComponent(combo.goal)}" class="cta">Get Your Next Step →</a>
  
  <div class="related">
    <h4>Related:</h4>
    ${dimensions.goal.slice(0, 5).filter(g => g !== combo.goal).map(g => 
      `<a href="/p/${slugify(combo.audience)}-${slugify(g)}-${slugify(combo.context)}/">${g}</a>`
    ).join('')}
  </div>
  
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P4ZLGKH1E1"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-P4ZLGKH1E1');</script>
</body>
</html>
`.trim();

  return { slug, content };
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Generating Programmatic SEO pages...');
  
  const combinations = generateCombinations(dimensions);
  console.log(`📊 Total combinations: ${combinations.length}`);
  
  const urls = [];
  let generated = 0;
  
  for (const combo of combinations) {
    const { slug, content } = generatePageContent(combo);
    const pageDir = path.join(OUTPUT_DIR, slug);
    
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(pageDir, 'index.html'), content);
    urls.push(`${SITE_URL}/p/${slug}/`);
    generated++;
    
    if (generated % 1000 === 0) {
      console.log(`   Generated ${generated} pages...`);
    }
  }
  
  // Generate sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`).join('\n')}
</urlset>`;
  
  fs.writeFileSync(SITEMAP_PATH, sitemap);
  
  console.log(`✅ Generated ${generated} pages`);
  console.log(`✅ Sitemap written to ${SITEMAP_PATH} (${urls.length} URLs)`);
}

main();
