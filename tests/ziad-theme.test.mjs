import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('theme is branded as ziad theme and loads its global assets', async () => {
  const [schema, layout] = await Promise.all([
    read('config/settings_schema.json'),
    read('layout/theme.liquid'),
  ]);

  assert.match(schema, /"theme_name"\s*:\s*"ziad theme"/i);
  assert.match(layout, /ziad-theme\.css/);
  assert.match(layout, /ziad-theme\.js/);
});

test('homepage uses the ziad responsive commerce sections', async () => {
  const template = JSON.parse(await read('templates/index.json'));
  const types = Object.values(template.sections).map((section) => section.type);

  assert.deepEqual(types, [
    'ziad-hero',
    'ziad-collections',
    'ziad-product-edit',
    'ziad-editorial-story',
    'ziad-community',
  ]);
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
