class ZiadProductView extends HTMLElement {
  connectedCallback() {
    this.buttons = [...this.querySelectorAll('[data-ziad-product-view]')];
    this.grid = this.querySelector('[data-ziad-product-grid]');
    this.railEvents?.abort();
    this.railEvents = new AbortController();
    const { signal } = this.railEvents;
    this.buttons.forEach((button) => button.addEventListener('click', () => this.select(button), { signal }));
    const controls = this.querySelector('[data-ziad-rail-controls]');
    if (!this.grid || !controls) return;

    const arrows = [...controls.querySelectorAll('[data-ziad-rail-step]')];
    const refresh = () => {
      const max = this.grid.scrollWidth - this.grid.clientWidth;
      const position = Math.abs(this.grid.scrollLeft);
      controls.hidden = max < 2;
      arrows[0].disabled = position < 2;
      arrows[1].disabled = position >= max - 2;
    };

    arrows.forEach((button) => button.addEventListener('click', () => {
      const gap = parseFloat(getComputedStyle(this.grid).columnGap) || 0;
      const distance = (this.grid.firstElementChild?.getBoundingClientRect().width || 0) + gap;
      const direction = getComputedStyle(this.grid).direction === 'rtl' ? -1 : 1;
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.grid.scrollBy({ left: distance * Number(button.dataset.ziadRailStep) * direction, behavior: reducedMotion ? 'instant' : 'smooth' });
    }, { signal }));
    this.grid.addEventListener('scroll', refresh, { signal, passive: true });
    this.railObserver = new ResizeObserver(refresh);
    this.railObserver.observe(this.grid);
    refresh();
  }

  disconnectedCallback() {
    this.railEvents?.abort();
    this.railObserver?.disconnect();
  }

  select(activeButton) {
    const productView = activeButton.dataset.ziadProductView === 'product';
    this.buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === activeButton)));
    this.grid?.classList.toggle('zt-product-edit__grid--product', productView);
  }
}

if (!customElements.get('ziad-product-view')) {
  customElements.define('ziad-product-view', ZiadProductView);
}

class ZiadStickyPurchase extends HTMLElement {
  connectedCallback() {
    this.sectionId = this.dataset.sectionId;
    this.targetFormId = this.dataset.targetForm;
    this.purchaseButton = this.querySelector('.zt-sticky-purchase__button');
    this.purchaseButton?.addEventListener('click', () => this.submitMainForm());

    this.observeMainButton();

    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      this.variantUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
        if (event.data.sectionId !== this.sectionId) return;
        this.updateVariant(event.data.variant, event.data.html);
        this.observeMainButton();
      });
    }
  }

  disconnectedCallback() {
    this.variantUnsubscriber?.();
    this.visibilityObserver?.disconnect();
  }

  get mainButton() {
    return document.getElementById(this.targetFormId)?.querySelector('[name="add"]');
  }

  submitMainForm() {
    const button = this.mainButton;
    if (!button || button.disabled) return;
    button.click();
  }

  observeMainButton() {
    this.visibilityObserver?.disconnect();
    const button = this.mainButton;
    if (!button || !('IntersectionObserver' in window)) return;

    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.hidden = entry.isIntersecting;
    }, { threshold: 0.15 });
    this.visibilityObserver.observe(button);
  }

  updateVariant(variant, html) {
    const label = this.purchaseButton?.querySelector('span:first-child');
    const variantLabel = this.querySelector('.zt-sticky-purchase__variant');
    const price = html?.getElementById(`price-${this.sectionId}`)?.querySelector('.price');
    const priceTarget = this.querySelector('.zt-sticky-purchase__price');
    const image = this.querySelector('.zt-sticky-purchase__image');
    const available = Boolean(variant?.available);

    if (variantLabel) variantLabel.textContent = variant?.title || '';
    if (price && priceTarget) priceTarget.innerHTML = price.outerHTML;
    if (this.purchaseButton) this.purchaseButton.disabled = !available;
    if (label) label.textContent = available ? 'Add to bag' : 'Sold out';
    if (image && variant?.featured_media?.preview_image?.src) {
      image.src = variant.featured_media.preview_image.src;
      image.removeAttribute('srcset');
    }
  }
}

if (!customElements.get('ziad-sticky-purchase')) {
  customElements.define('ziad-sticky-purchase', ZiadStickyPurchase);
}

class ZiadWishlistStore {
  static key = 'ziad:wishlist:v1';

  static read() {
    try {
      const items = JSON.parse(localStorage.getItem(this.key) || '[]');
      return Array.isArray(items) ? items.filter((item) => item?.handle && item?.url) : [];
    } catch (_error) {
      return [];
    }
  }

  static write(items) {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
    } catch (_error) {
      return;
    }
    document.dispatchEvent(new CustomEvent('ziad:wishlist-change', { detail: { items } }));
  }

  static toggle(item) {
    const items = this.read();
    const existingIndex = items.findIndex((saved) => saved.handle === item.handle);
    if (existingIndex >= 0) items.splice(existingIndex, 1);
    else items.unshift(item);
    this.write(items.slice(0, 50));
  }
}

class ZiadWishlistButton extends HTMLElement {
  connectedCallback() {
    this.button = this.querySelector('button');
    this.label = this.querySelector('[data-ziad-wishlist-label]');
    this.onChange = () => this.sync();
    this.button?.addEventListener('click', () => ZiadWishlistStore.toggle(this.item));
    document.addEventListener('ziad:wishlist-change', this.onChange);
    this.sync();
  }

  disconnectedCallback() {
    document.removeEventListener('ziad:wishlist-change', this.onChange);
  }

  get item() {
    return {
      handle: this.dataset.productHandle,
      title: this.dataset.productTitle,
      url: this.dataset.productUrl,
      price: this.dataset.productPrice,
      image: this.dataset.productImage,
    };
  }

  sync() {
    const saved = ZiadWishlistStore.read().some((item) => item.handle === this.dataset.productHandle);
    this.toggleAttribute('data-saved', saved);
    this.button?.setAttribute('aria-pressed', String(saved));
    if (this.button) this.button.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${this.dataset.productTitle}`);
    if (this.label) this.label.textContent = saved ? 'Saved to wishlist' : 'Save to wishlist';
  }
}

if (!customElements.get('ziad-wishlist-button')) {
  customElements.define('ziad-wishlist-button', ZiadWishlistButton);
}

class ZiadWishlistDrawer extends HTMLElement {
  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    this.itemsContainer = this.querySelector('[data-ziad-wishlist-items]');
    this.emptyState = this.querySelector('[data-ziad-wishlist-empty]');
    this.drawerCount = this.querySelector('[data-ziad-wishlist-drawer-count]');
    this.onWishlistChange = (event) => this.render(event.detail.items);
    this.onDocumentClick = (event) => {
      if (event.target.closest('[data-ziad-wishlist-open]')) this.open();
      if (event.target.closest('[data-ziad-wishlist-close]')) this.dialog?.close();
      const removeButton = event.target.closest('[data-ziad-wishlist-remove]');
      if (removeButton) {
        const item = ZiadWishlistStore.read().find((saved) => saved.handle === removeButton.dataset.ziadWishlistRemove);
        if (item) ZiadWishlistStore.toggle(item);
      }
    };

    document.addEventListener('ziad:wishlist-change', this.onWishlistChange);
    document.addEventListener('click', this.onDocumentClick);
    window.addEventListener('storage', this.onStorage = () => this.render(ZiadWishlistStore.read()));
    this.dialog?.addEventListener('click', (event) => {
      if (event.target === this.dialog) this.dialog.close();
    });
    this.render(ZiadWishlistStore.read());
  }

  disconnectedCallback() {
    document.removeEventListener('ziad:wishlist-change', this.onWishlistChange);
    document.removeEventListener('click', this.onDocumentClick);
    window.removeEventListener('storage', this.onStorage);
  }

  open() {
    this.render(ZiadWishlistStore.read());
    if (!this.dialog?.open) this.dialog?.showModal();
  }

  render(items) {
    if (!this.itemsContainer) return;
    this.itemsContainer.replaceChildren(...items.map((item) => this.createItem(item)));
    this.emptyState?.toggleAttribute('hidden', items.length > 0);
    if (this.drawerCount) this.drawerCount.textContent = items.length ? `(${items.length})` : '';
    document.querySelectorAll('[data-ziad-wishlist-count]').forEach((count) => {
      count.textContent = String(items.length);
      count.hidden = items.length === 0;
    });
  }

  createItem(item) {
    const article = document.createElement('article');
    article.className = 'zt-wishlist-item';

    const link = document.createElement('a');
    link.className = 'zt-wishlist-item__media';
    link.href = item.url.startsWith('/') ? item.url : '#';
    if (item.image) {
      const image = document.createElement('img');
      image.src = item.image;
      image.alt = '';
      image.loading = 'lazy';
      link.append(image);
    }

    const details = document.createElement('div');
    details.className = 'zt-wishlist-item__details';
    const title = document.createElement('a');
    title.className = 'zt-wishlist-item__title';
    title.href = link.href;
    title.textContent = item.title;
    const price = document.createElement('p');
    price.className = 'zt-wishlist-item__price';
    price.textContent = item.price;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'zt-wishlist-item__remove';
    remove.dataset.ziadWishlistRemove = item.handle;
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${item.title} from wishlist`);
    details.append(title, price, remove);
    article.append(link, details);
    return article;
  }
}

if (!customElements.get('ziad-wishlist-drawer')) {
  customElements.define('ziad-wishlist-drawer', ZiadWishlistDrawer);
}

class ZiadRecentlyViewed extends HTMLElement {
  static key = 'ziad:recently-viewed:v1';

  connectedCallback() {
    this.list = this.querySelector('[data-ziad-recently-viewed-list]');
    this.maxItems = Number.parseInt(this.dataset.maxItems || '4', 10);
    const storedItems = this.read();
    const previousItems = storedItems
      .filter((item) => item.handle !== this.dataset.currentHandle)
      .slice(0, this.maxItems);

    this.render(previousItems);
    this.write([
      this.currentItem,
      ...storedItems.filter((item) => item.handle !== this.dataset.currentHandle),
    ].slice(0, 12));
  }

  get currentItem() {
    return {
      handle: this.dataset.currentHandle,
      title: this.dataset.currentTitle,
      url: this.dataset.currentUrl,
      price: this.dataset.currentPrice,
      image: this.dataset.currentImage,
    };
  }

  read() {
    try {
      const items = JSON.parse(localStorage.getItem(ZiadRecentlyViewed.key) || '[]');
      return Array.isArray(items) ? items.filter((item) => item?.handle && item?.url) : [];
    } catch (_error) {
      return [];
    }
  }

  write(items) {
    if (!this.dataset.currentHandle) return;
    try {
      localStorage.setItem(ZiadRecentlyViewed.key, JSON.stringify(items));
    } catch (_error) {
      // Browsing still works when storage is unavailable.
    }
  }

  render(items) {
    if (!this.list) return;
    this.list.replaceChildren(...items.map((item) => this.createCard(item)));
    this.hidden = items.length === 0;
  }

  createCard(item) {
    const article = document.createElement('article');
    article.className = 'zt-recent-card';
    article.setAttribute('role', 'listitem');

    const link = document.createElement('a');
    link.className = 'zt-recent-card__link';
    link.href = item.url.startsWith('/') ? item.url : '#';
    if (item.image) {
      const image = document.createElement('img');
      image.src = item.image;
      image.alt = item.title;
      image.loading = 'lazy';
      image.width = 450;
      image.height = 563;
      link.append(image);
    }

    const details = document.createElement('div');
    details.className = 'zt-recent-card__details';
    const title = document.createElement('h3');
    title.textContent = item.title;
    const price = document.createElement('p');
    price.textContent = item.price;
    details.append(title, price);
    link.append(details);
    article.append(link);
    return article;
  }
}

if (!customElements.get('ziad-recently-viewed')) {
  customElements.define('ziad-recently-viewed', ZiadRecentlyViewed);
}

document.addEventListener('click', (event) => {
  const openButton = event.target.closest('[data-ziad-size-chart-open]');
  if (openButton) {
    document.getElementById(openButton.getAttribute('aria-controls'))?.showModal();
    return;
  }

  const closeButton = event.target.closest('[data-ziad-size-chart-close]');
  if (closeButton) closeButton.closest('dialog')?.close();
});

document.addEventListener('click', (event) => {
  if (event.target instanceof HTMLDialogElement && event.target.hasAttribute('data-ziad-size-chart')) {
    const bounds = event.target.getBoundingClientRect();
    const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!inside) event.target.close();
  }
});
