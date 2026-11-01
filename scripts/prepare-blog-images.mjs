import sharp from 'sharp';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
const path = 'src/lib/blog-content.json';
const articles = JSON.parse(await readFile(path, 'utf8'));
const selections = {
  'facial-tissue-vs-napkins-vs-paper-towels': ['range', 'images/about-product-range.png', 'A selection of tissue and hygiene product formats'],
  'boxed-vs-soft-pack-tissues-business': ['soft-pack', 'rate-products/rose-petal-soft-pack.jpg', 'Rose Petal soft pack tissue packaging'],
  'jumbo-vs-standard-toilet-rolls': ['toilet-roll', 'rate-products/super-soft-unwrapped-toilet-roll-bigger.png', 'Unwrapped toilet roll showing the roll and core format'],
  'multifold-vs-roll-paper-hand-towels': ['hand-towels', 'rate-products/softex-tissue-stack-prime.png', 'Folded tissue towel refill pack'],
  'tissue-dispenser-refill-compatibility-checklist': ['dispenser', 'rate-products/softex-tissue-towel-dispenser-ar1220.png', 'Wall-mounted tissue towel dispenser'],
  'restaurant-paper-napkins-buying-guide': ['napkins', 'rate-products/super-soft-table-napkin.png', 'Super Soft table napkin pack'],
  'rose-petal-tissue-wholesale-guide': ['rose-petal', 'images/brands/rose-petal-real.jpg', 'Rose Petal tissue product packaging'],
  'bulk-hand-wash-refill-buying-guide': ['hand-wash', 'rate-products/fresco-hand-wash.jpg', 'Fresco hand wash container'],
  'garbage-bag-size-guide-commercial-bins': ['bin-liners', 'images/products/garbage-bags-real.jpg', 'Workplace garbage bag liners'],
  'paper-cups-bulk-office-cafe-guide': ['cups', 'rate-products/paper-coffee-cups-8oz.jpg', 'Paper cups for beverage service'],
};
const defaults = {
  'Tissue & paper': ['tissue-boxes', 'images/brands/nozomi-tissue-boxes.jpg', 'Nozomi boxed tissues'],
  'Buying & budgeting': ['warehouse', 'images/warehouse-team.webp', 'Warehouse staff checking tissue cartons'],
  'Workplace planning': ['workplace', 'images/hero-workspace-hygiene.png', 'A selection of workplace hygiene supplies'],
  'Washroom supplies': ['range', 'images/about-product-range.png', 'Tissue and washroom supply product range'],
  'Cleaning & disposables': ['cleaning', 'images/brands/cleaning-items-tools.jpg', 'Cleaning tools and supplies'],
  'Custom branding': ['custom-box', 'images/custom-branded-tissue-box-cutout.webp', 'Custom printed Pak Multilinks tissue box'],
};
await mkdir('public/images/blog', {recursive:true});
const prepared = new Set(); let inputBytes=0, outputBytes=0;
for (const article of articles) {
  const [key, source, alt] = selections[article.slug] || defaults[article.category];
  if (!prepared.has(key)) {
    prepared.add(key);
    inputBytes += (await stat('public/'+source)).size;
    for (const [suffix, width, quality] of [['',1200,82],['-thumb',600,76]]) {
      const target = `public/images/blog/${key}${suffix}.webp`;
      await sharp('public/'+source).resize({width,withoutEnlargement:true}).webp({quality}).toFile(target);
      outputBytes += (await stat(target)).size;
    }
  }
  article.image = `/images/blog/${key}.webp`;
  article.thumbnail = `/images/blog/${key}-thumb.webp`;
  article.imageAlt = alt;
}
await writeFile(path, JSON.stringify(articles,null,2)+'\n');
console.log(JSON.stringify({sourceAssets:prepared.size,inputBytes,outputBytes}));
