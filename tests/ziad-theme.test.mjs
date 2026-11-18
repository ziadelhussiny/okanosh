import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const parseJsonc = (source) => JSON.parse(source.replace(/\/\*[\s\S]*?\*\//g, '').trim());

test('theme is branded as ziad theme and loads its global assets', async () => {
  const [schema, layout] = await Promise.all([
    read('config/settings_schema.json'),
    read('layout/theme.liquid'),
  ]);

  assert.match(schema, /"theme_name"\s*:\s*"ziad theme"/i);
  assert.match(layout, /ziad-theme\.css/);
  assert.match(layout, /ziad-theme\.js/);
});

test('homepage uses a focused ziad editorial commerce sequence', async () => {
  const source = await read('templates/index.json');
  const template = parseJsonc(source);
  const types = template.order.map((id) => template.sections[id].type);

  assert.deepEqual(types, [
    'ziad-hero',
    'ziad-collections',
    'ziad-product-edit',
    'ziad-editorial-story',
    'ziad-community',
  ]);
});

test('optional premium sections remain editable in the theme library', async () => {
  const [valueStrip, shopTheLook] = await Promise.all([
    read('sections/ziad-value-strip.liquid'),
    read('sections/ziad-shop-the-look.liquid'),
  ]);

  assert.match(valueStrip, /section\.blocks/);
  assert.match(valueStrip, /"max_blocks"\s*:\s*4/);
  assert.match(shopTheLook, /block\.settings\.product/);
  assert.match(shopTheLook, /render 'price'/);
  assert.match(shopTheLook, /"type"\s*:\s*"product"/);
  assert.match(shopTheLook, /has_only_default_variant/);
  assert.match(shopTheLook, /Choose your size/);
});

test('hero supports responsive image and video media', async () => {
  const hero = await read('sections/ziad-hero.liquid');

  for (const setting of [
    'desktop_media_type',
    'desktop_image',
    'desktop_video',
    'mobile_media_type',
    'mobile_image',
    'mobile_video',
  ]) {
    assert.match(hero, new RegExp(`"id"\\s*:\\s*"${setting}"`));
  }

  assert.match(hero, /<video/i);
  assert.match(hero, /image_url/);
});

test('product page includes a per-product size chart block', async () => {
  const [mainProduct, snippet, productTemplate] = await Promise.all([
    read('sections/main-product.liquid'),
    read('snippets/ziad-size-chart.liquid'),
    read('templates/product.json'),
  ]);

  assert.match(mainProduct, /when 'size_chart'/);
  assert.match(mainProduct, /render 'ziad-size-chart'/);
  assert.match(mainProduct, /"type"\s*:\s*"size_chart"/);
  assert.match(snippet, /product\.metafields\.custom\.size_chart/);
  assert.match(snippet, /product\.metafields\.custom\.size/);
  assert.match(snippet, /<dialog/);
  assert.match(productTemplate, /"type"\s*:\s*"size_chart"/);
});

test('global palette exposes all four Rose Terracotta tokens', async () => {
  const css = await read('assets/ziad-theme.css');

  for (const color of ['#F8F3EF', '#352A25', '#BC7969', '#E5CBC3']) {
    assert.ok(css.toUpperCase().includes(color), `missing ${color}`);
  }
});

test('product purchase experience includes assurance and sticky add to cart', async () => {
  const [mainProduct, stickyBar, productTemplate, script] = await Promise.all([
    read('sections/main-product.liquid'),
    read('snippets/ziad-sticky-purchase.liquid'),
    read('templates/product.json'),
    read('assets/ziad-theme.js'),
  ]);

  assert.match(mainProduct, /when 'purchase_assurance'/);
  assert.match(mainProduct, /render 'ziad-sticky-purchase'/);
  assert.match(productTemplate, /"type"\s*:\s*"purchase_assurance"/);
  assert.match(stickyBar, /data-ziad-sticky-purchase/);
  assert.match(stickyBar, /data-target-form/);
  assert.match(script, /ZiadStickyPurchase/);
});

test('cart drawer communicates progress to complimentary shipping', async () => {
  const drawer = await read('snippets/cart-drawer.liquid');

  assert.match(drawer, /ziad-shipping-progress/);
  assert.match(drawer, /300000/);
  assert.match(drawer, /role="progressbar"/);
});

test('wishlist works across product cards, product pages and the header drawer', async () => {
  const [layout, header, card, mainProduct, productTemplate, drawer, script] = await Promise.all([
    read('layout/theme.liquid'),
    read('sections/header.liquid'),
    read('snippets/card-product.liquid'),
    read('sections/main-product.liquid'),
    read('templates/product.json'),
    read('snippets/ziad-wishlist-drawer.liquid'),
    read('assets/ziad-theme.js'),
  ]);

  assert.match(layout, /render 'ziad-wishlist-drawer'/);
  assert.match(header, /data-ziad-wishlist-open/);
  assert.match(header, /data-ziad-wishlist-count/);
  assert.match(card, /render 'ziad-wishlist-button'/);
  assert.match(mainProduct, /when 'wishlist'/);
  assert.match(productTemplate, /"type"\s*:\s*"wishlist"/);
  assert.match(drawer, /<dialog/);
  assert.match(drawer, /data-ziad-wishlist-items/);
  assert.match(script, /localStorage/);
  assert.match(script, /ZiadWishlistButton/);
  assert.match(script, /ZiadWishlistDrawer/);
});

test('product pages include a private on-device recently viewed rail', async () => {
  const [section, productTemplate, script] = await Promise.all([
    read('sections/ziad-recently-viewed.liquid'),
    read('templates/product.json'),
    read('assets/ziad-theme.js'),
  ]);

  const template = parseJsonc(productTemplate);
  assert.equal(template.sections['recently-viewed'].type, 'ziad-recently-viewed');
  assert.ok(template.order.includes('recently-viewed'));
  assert.match(section, /data-current-handle/);
  assert.match(section, /data-ziad-recently-viewed-list/);
  assert.match(script, /ziad:recently-viewed:v1/);
  assert.match(script, /ZiadRecentlyViewed/);
  assert.match(script, /replaceChildren/);
});

test('footer has resilient shop and customer-care navigation fallbacks', async () => {
  const [footer, footerGroup] = await Promise.all([
    read('sections/footer.liquid'),
    read('sections/footer-group.json'),
  ]);

  assert.match(footer, /Start a Return or Exchange/);
  assert.match(footer, /shop\.refund_policy\.url/);
  assert.match(footer, /shop\.shipping_policy\.url/);
  assert.match(footer, /shop\.privacy_policy\.url/);
  assert.match(footer, /shop\.terms_of_service\.url/);
  assert.match(footer, /New arrivals/i);
  assert.match(footerGroup, /Join the Okanosh List/);
});

test('theme ships a dedicated return and exchange request page', async () => {
  const [templateSource, form] = await Promise.all([
    read('templates/page.return-exchange.json'),
    read('sections/ziad-return-form.liquid'),
  ]);
  const template = parseJsonc(templateSource);

  assert.equal(template.sections.main.type, 'ziad-return-form');
  assert.match(form, /form 'contact'/);
  assert.match(form, /contact\[Order number\]/);
  assert.match(form, /contact\[Requested action\]/);
  assert.match(form, /contact\[Products\]/);
  assert.match(form, /contact\[Reason\]/);
  assert.match(form, /posted_successfully/);
});

test('Dawn color schemes are not overridden by the custom global stylesheet', async () => {
  const css = await read('assets/ziad-theme.css');

  assert.doesNotMatch(css, /body\s*,\s*\.gradient\s*\{/);
  assert.match(css, /\.zt-section\s*\{[^}]*background:\s*rgb\(var\(--color-background\)\)/s);
  assert.match(css, /\.zt-section\s*\{[^}]*color:\s*rgb\(var\(--color-foreground\)\)/s);
});

test('theme settings use an editorial display font with a readable retail UI font', async () => {
  const settings = parseJsonc(await read('config/settings_data.json'));
  const current = settings.current;

  assert.equal(current.type_header_font, 'aleo_n4');
  assert.equal(current.type_body_font, 'assistant_n4');
  assert.equal(current.page_width, 1600);
  assert.equal(current.cart_type, 'drawer');
  assert.equal(current.animations_reveal_on_scroll, false);
});

test('custom commerce elements participate in normal block layout', async () => {
  const css = await read('assets/ziad-theme.css');

  assert.match(css, /ziad-product-view\s*,[\s\S]*ziad-recently-viewed[\s\S]*display:\s*block/);
});

test('model and product view toggle visibly swaps primary and secondary product media', async () => {
  const css = await read('assets/ziad-theme.css');

  assert.match(css, /zt-product-edit__grid--product[^{]*img:first-child[^{]*\{[^}]*opacity:\s*0/s);
  assert.match(css, /zt-product-edit__grid--product[^{]*img:nth-child\(2\)[^{]*\{[^}]*opacity:\s*1/s);
});

test('responsive hero falls back to an image when selected video media is unavailable', async () => {
  const hero = await read('sections/ziad-hero.liquid');

  assert.match(hero, /desktop_video == blank and section\.settings\.desktop_video_url == blank/);
  assert.match(hero, /mobile_video == blank and section\.settings\.mobile_video_url == blank/);
});

test('mobile hero media has a bounded viewport-aware height', async () => {
  const css = await read('assets/ziad-theme.css');

  assert.match(css, /\.zt-hero__mobile-media\s*\{[^}]*height:\s*clamp\([^;]+svh[^;]+\)/s);
  assert.match(css, /\.zt-hero__mobile-media\s*\{[^}]*min-height:\s*0/s);
});
