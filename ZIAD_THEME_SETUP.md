# ziad theme — Shopify setup

The theme is designed to work immediately with the existing Okanosh products and collections. Complete these store-admin steps after uploading or syncing the theme.

## 1. Per-product size charts

In **Settings → Custom data → Products**, add a definition with:

- Name: `Size chart`
- Namespace and key: `custom.size_chart`
- Recommended type: Rich text or File

Populate it separately on every product. The product template checks `custom.size_chart`, then the legacy `custom.size`, then the fallback page selected in the Size chart block.

## 2. Return and exchange page

In **Online Store → Pages**:

1. Create a page named `Start a Return or Exchange`.
2. Set its URL handle to `return-exchange-form`.
3. Assign the theme template `page.return-exchange`.
4. Save the page.

Requests are delivered through Shopify's native contact-form email flow and include the order number, requested action, products, reason and customer details.

## 3. Navigation

- Main menu: add New Arrivals, Shop, Collections, About Us and Sale. Nested Shop/Collections links will render as the configured mega menu.
- Footer: menus with handles `footer` and `customer-care` are supported.
- If either footer menu is missing or empty, the theme renders complete Shop and Customer Care fallback links automatically.

## 4. Homepage content

- Responsive hero: select separate desktop/mobile images or videos.
- Shop the Look: choose up to three specific products. If none are selected, the first products from the fallback collection are used.
- Community: replace the example review copy and customer photo with approved customer content.
- Editorial story: select current campaign and brand-story images.

## 5. Social and payments

Add Instagram and TikTok URLs in Theme settings → Social media. Payment icons use the payment methods enabled in Shopify Payments.

## 6. On-device personalization

- Wishlist and Recently Viewed use browser storage and do not require an app.
- They do not sync across different devices or browsers.
- For account-synced wishlists or automated back-in-stock messages, connect a Shopify app or customer-metafield backend before advertising those capabilities.

## 7. Final QA

Run a Shopify theme preview and verify:

- Home, collection, search, product, cart, contact and return/exchange pages.
- One available product, one multi-size product and one sold-out product.
- Cart drawer progress below and above 3,000 L.E.
- Desktop, tablet and mobile layouts.
- Theme Editor section settings and real navigation menus.
