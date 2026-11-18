class ZiadProductView extends HTMLElement {
  connectedCallback() {
    this.buttons = [...this.querySelectorAll('[data-ziad-product-view]')];
    this.grid = this.querySelector('[data-ziad-product-grid]');
    this.buttons.forEach((button) => button.addEventListener('click', () => this.select(button)));
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
