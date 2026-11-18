# Working in dawn-private

## Project guidance

- This repository is the source of truth for Dawn and its child themes. Public `Shopify/dawn` receives one-way release snapshots; make source changes here.
- Read [README.md](README.md) for project context and [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for theme code principles. Keep storefront code lean and web-native; do not add storefront runtime dependencies.
- Read [RELEASE.md](RELEASE.md) before changing release tooling or sync behavior. Preserve child-theme-owned configuration and respect the child-theme and public sync allowlists. Do not run release or publishing commands unless explicitly requested.

## Tests

- Read [tests/README.md](tests/README.md) before adding or changing tests. Use the smallest test level that proves the behavior: plain Node for pure logic, jsdom for DOM behavior, and LiquidJS plus jsdom when the rendering-to-JavaScript contract matters.
- Exercise real production functions, snippets, and scripts rather than copying their implementations into tests. For regressions, verify that the test fails without the fix and passes with it.
- Reuse `tests/utils/` for Liquid and DOM setup. Keep component-specific data in `tests/fixtures/` and platform filter stubs explicit near the tests that need them. Do not grow the helpers into a general Shopify simulator.
- Pass the test context to `createDOM()` so it fails on jsdom errors or unexpected `console.error` output and closes the window during teardown. For expected console errors, stub `window.console.error` in the test and assert the captured arguments.
- jsdom has no `fetch`; stub `window.fetch` explicitly with synthetic responses for tests that need it, and await asynchronous work. Do not fall back to real network requests.
- Window-local subscriptions and timers need no extra cleanup. Clean up resources outside the window, such as Node timers, patched Node globals, and external handles. `t.after` hooks registered after `createDOM()` run after the window closes.
- Use only trusted theme scripts and synthetic fixture data. jsdom is not a security sandbox.
- Do not infer layout, accessibility, cross-browser, or Shopify-platform correctness from jsdom or LiquidJS results.
- Dawn has no configured development store or real-browser test setup for this approach. References to those checks are validation guidance, not existing project capabilities. If they are acceptance criteria, report the validation as incomplete and ask the project owner for an approved environment; do not assume credentials or provisioning instructions exist.

## Validation

Use Node and pnpm versions from `package.json`. Install dependencies with `pnpm install --frozen-lockfile`, then run `pnpm test` and `pnpm lint`. Run `pnpm theme-check` for Liquid changes. For workflow changes, also run `devx //areas/tools/gha-lint .github/workflows` and use Shopify's required setup actions.

Follow the changeset rules in [RELEASE.md](RELEASE.md): theme-file changes require a changeset, while tooling-only or documentation-only changes must not include one. Report failing checks and distinguish existing failures from those introduced by the change.
