# ziad theme blueprint

## Goal

Rebuild the Okanosh Dawn child theme around the approved Rose Terracotta desktop and mobile layouts while keeping every section editable in Shopify's Theme Editor.

## Visual system

- Background: `#F8F3EF`
- Text / dark surface: `#352A25`
- Accent: `#BC7969`
- Light detail: `#E5CBC3`
- Square controls, hairline dividers, editorial headings, product-first imagery.

## Page map

- Home: responsive media hero, collection rail, product edit, editorial story, community proof.
- Collection/search/cart/content pages: global tokens and Dawn-native responsive behavior.
- Product: gallery, variants, per-product size chart, buy actions, policy/care accordions, recommendations.

## Homepage sections

1. Responsive hero — desktop/mobile image or video, editable copy and CTA.
2. Collection rail — real Shopify collection images and links.
3. Product edit — real collection products, quick add, model/product media view.
4. Editorial story — full-bleed campaign media plus brand story.
5. Community — image and text testimonials, newsletter handoff.

## Product size chart contract

Priority order:

1. `product.metafields.custom.size_chart`
2. `product.metafields.custom.size`
3. Optional page selected on the Size chart block

Supported values: image/file reference, rich text, multi-line text and list text.

## Responsive behavior

- Desktop hero may split media and copy; mobile stacks media above copy.
- Collection and community rows use scroll snap on small screens.
- Product edit uses two columns on mobile and four on desktop.
- All tap targets are at least 44px and focus states remain visible.

## QA

- Node contract tests for theme wiring and per-product size chart support.
- JSON parsing for all templates/config.
- Liquid syntax via Theme Check when available.
- Desktop and mobile browser screenshots when a Shopify preview environment is available.

