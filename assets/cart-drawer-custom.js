const cartIcon = document.querySelector('#cart-icon-bubble');
const drawer = document.querySelector('.drawer');
const cartItems = drawer.querySelector('.cart-items');
const cartFooter = drawer.querySelector('.drawer__footer');
const quantityIcons = drawer.querySelectorAll('.quantity__button');
const ATCButton = document.querySelector('.product-button__atc');

const addEventListeners = () => {
  const quantityInputs = drawer.querySelectorAll('.quantity__input');
  const removeItemIcons = drawer.querySelectorAll('.cart-remove-button');
  quantityIcons.forEach(icon => icon.addEventListener('click', (e) => { updateQuantity(e) }));
  quantityInputs.forEach(icon => icon.addEventListener('change', (e) => { updateQuantity(e) }));
  removeItemIcons.forEach(icon => icon.addEventListener('click', e => { updateQuantity(e, 0) }));
  cartIcon.addEventListener("click", (e) => openDrawer(e));
  const drawerClose = document.querySelector('.drawer__close');
  drawerClose.addEventListener("click", (e) => closeDrawer(e));
}
const openDrawer = (e) => {
  if (e) { e.preventDefault(); }
  drawer.classList.add('animate', 'active');
}
const closeDrawer = (e) => {
  drawer.classList.remove('animate', 'active');
}

const changeCartCount = (newDrawer) => {
  const cartItemsQty = newDrawer.querySelectorAll('.cart-item').length;
  const cartCount = document.querySelector('.cart-count-bubble span');
  cartCount.innerText = cartItemsQty;
}

const handleErrors = (error, selector) => {
  const errorSpan = document.querySelector(selector);
  errorSpan.parentNode.classList.remove('hidden');
  errorSpan.innerText = error;
}

const getQuantityInfo = e => {
  e.stopPropagation();
  const item = e.target.parentNode.querySelector('.quantity__input') || e.currentTarget.parentNode;
  const quantity = item.value || 0;
  const line = item.dataset.index;
  return {
    quantity,
    line
  }
}

const fetchConfig = (type = 'json') => {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
  };
}

const updateCart = (url, config) => {
  fetch(url, config)
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        const item = JSON.parse(config.body).line;
        handleErrors(data.message, `#CartDrawer-LineItemError-${item}`);
      } else {
        const sectionHTML = new DOMParser().parseFromString(data.sections['cart-drawer-custom'], 'text/html');
        const newDrawer = sectionHTML.querySelector('.drawer');
        drawer.innerHTML = newDrawer.innerHTML;
        addEventListeners();
        changeCartCount(newDrawer);
        quantityIcons.forEach(icon => icon.classList.remove('disabled'));
      }
    })
    .catch(error => console.log(error));
}

const ajaxAddToCart = (url, config) => {
  fetch(url, config)
    .then((response) => response.json())
    .then((response) => {
      if (response.status) {
        handleErrors(response.description, '.product-form__error-message');
      } else {
        ATCButton.classList.add('loading');
        ATCButton.querySelector('.loading__spinner').classList.remove('hidden');
        const sectionHTML = new DOMParser().parseFromString(response.sections['cart-drawer-custom'], 'text/html');
        const newDrawer = sectionHTML.querySelector('.drawer');
        drawer.innerHTML = newDrawer.innerHTML;
        addEventListeners();
        openDrawer();
      }
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      ATCButton.classList.remove('loading');
      if (drawer && drawer.classList.contains('is-empty')) drawer.classList.remove('is-empty');
      ATCButton.querySelector('.loading__spinner').classList.add('hidden');
    });
}

const updateQuantity = (e, quantity) => {
  const itemInfo = getQuantityInfo(e);
  quantity = quantity || itemInfo.quantity;
  quantityIcons.forEach(icon => icon.classList.add('disabled'));

  const body = JSON.stringify({
    line: itemInfo.line,
    quantity: itemInfo.quantity,
    sections: 'cart-drawer-custom'
  });
  const config = fetchConfig('javascript');
  config.body = body;

  updateCart(`${routes.cart_change_url}`, config);
}

const addToCart = (e) => {
  e.preventDefault();
  const addToCartForm = document.querySelector('form[action$="/cart/add"]');
  const formData = new FormData(addToCartForm);
  formData.append('sections', 'cart-drawer-custom');
  const config = fetchConfig('javascript');
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  delete config.headers['Content-Type'];
  config.body = formData;
  ajaxAddToCart(`${routes.cart_add_url}`, config);
}

ATCButton.addEventListener('click', (e) => addToCart(e));

addEventListeners();