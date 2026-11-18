# ziad theme blueprint

## Goal

Rebuild the Okanosh Dawn child theme around the approved Rose Terracotta desktop and mobile layouts while keeping every section editable in Shopify's Theme Editor.

## Design brief

- Product: Okanosh, a contemporary Egyptian womenswear store for expressive young women.
- Primary action: discover a collection, understand fit, and complete a purchase with confidence.
- Trust level: premium commerce; pricing, availability, fit, delivery and returns must be explicit.
- Direction: **Egyptian Editorial Fashion House** — magazine-like composition, product-led imagery and sharp retail controls.
- Layout strategy: an editorial commerce storyboard, alternating dense product rails with full-bleed campaign moments and customer proof.
- Must not resemble: a generic Shopify starter, a rounded SaaS landing page, a bento grid, or a decorative motion demo.

## Visual system

- Background: `#F8F3EF`
- Text / dark surface: `#352A25`
- Accent: `#BC7969`
- Light detail: `#E5CBC3`
- Square controls, hairline dividers, editorial headings, product-first imagery.
- Typography: expressive serif display type with a quiet, highly legible sans-serif retail UI layer.
- Spacing: balanced and content-dense; whitespace separates meaning rather than hiding missing content.
- Radius: square by default; no pill controls except native swatches.
- Elevation: borders and tonal surfaces first, shadows only for modal/drawer separation.
- Icons: Dawn's line icons and minimal custom line SVG; no emoji.
- Motion: 180–260ms state feedback for drawers, selectors and purchase actions; no decorative scroll reveal.

## Page map

- Home: responsive media hero, collection rail, product edit, editorial story, community proof.
- Collection/search/cart/content pages: global tokens and Dawn-native responsive behavior.
- Product: gallery, variants, per-product size chart, buy actions, policy/care accordions, recommendations.
- Customer care: a dedicated return/exchange request template with Shopify-native contact delivery and policy handoff.

## Homepage sections

1. Responsive hero — desktop/mobile image or video, editable copy and CTA.
2. Value strip — concise delivery, exchange, payment and local-brand assurances.
3. Collection rail — real Shopify collection images and links.
4. Product edit — real collection products, quick add, model/product media view.
5. Shop the look — one editorial image tied directly to shoppable products.
6. Editorial story — full-bleed campaign media plus brand story.
7. Community — image and text testimonials, newsletter handoff.

## Conversion features

- Mobile sticky purchase bar that delegates to the selected product variant and existing product form.
- Per-product fit chart with metafield-first content.
- Cart drawer free-shipping progress based on the 3,000 L.E. threshold.
- Purchase-assurance block for delivery, exchange and secure checkout.
- On-device wishlist across product cards and product pages, with a header count and accessible drawer.
- Recently viewed product rail stored privately on the device and hidden when no browsing history exists.
- Product recommendations and quick add remain Dawn-native for reliable cart behavior.

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
- Sticky actions never cover focused form controls and collapse for sold-out products.

## QA

- Node contract tests for theme wiring and per-product size chart support.
- JSON parsing for all templates/config.
- Liquid syntax via Theme Check when available.
- Desktop and mobile browser screenshots when a Shopify preview environment is available.

## Anti-slop quality gate

- AI Slop target: 0–2/10.
- Distinctiveness target: 8+/10.
- No gradient headlines, glow, glass, emoji icons, excessive radius, equal-weight feature cards or decorative animation.

