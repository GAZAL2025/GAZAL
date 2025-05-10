// تحميل المنتجات من localStorage أو إنشاء مصفوفة جديدة
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// عرض المنتجات في صفحة المنتجات
function displayProducts() {
  const container = document.getElementById('productList');
  if (!container) return;

  container.innerHTML = '';

  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${product.image}" width="100" />
      <h3>${product.name}</h3>
      <p>السعر: ${product.price} ريال</p>
      <button onclick="addToCart('${product.id}')">أضف إلى السلة</button>
      <button onclick="deleteProduct('${product.id}')">حذف المنتج</button>
    `;
    container.appendChild(div);
  });
}

// إضافة منتج جديد
function addProduct() {
  const name = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const imageInput = document.getElementById('productImage');
  const file = imageInput.files[0];

  if (!name || isNaN(price) || !file) {
    alert("يرجى إدخال كل البيانات.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const product = {
      id: Date.now().toString(),
      name,
      price,
      image: e.target.result
    };
    products.push(product);
    saveProducts();
    displayProducts();
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    imageInput.value = '';
  };
  reader.readAsDataURL(file);
}

// حذف منتج من صفحة المنتجات (ومن السلة إذا كان موجودًا)
function deleteProduct(productId) {
  products = products.filter(p => p.id !== productId);
  cart = cart.filter(p => p.id !== productId);
  saveProducts();
  saveCart();
  displayProducts();
  displayCartItems();
}

// إضافة إلى السلة
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(p => p.id === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  alert("تمت إضافة المنتج إلى السلة");
}

// عرض السلة
function displayCartItems() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('totalPrice');
  if (!container || !totalEl) return;

  container.innerHTML = '';
  let total = 0;

  cart.forEach(product => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${product.image}" width="50" />
      <strong>${product.name}</strong>
      <p>العدد: ${product.quantity}</p>
      <p>السعر: ${product.price * product.quantity} ريال</p>
      <button onclick="removeFromCart('${product.id}')">حذف من السلة</button>
    `;
    container.appendChild(div);
    total += product.price * product.quantity;
  });

  totalEl.innerText = `الإجمالي: ${total} ريال`;
}

// حذف منتج من السلة فقط
function removeFromCart(productId) {
  cart = cart.filter(p => p.id !== productId);
  saveCart();
  displayCartItems();
}

// عرض البيانات عند تحميل الصفحات
document.addEventListener('DOMContentLoaded', () => {
  displayProducts();
  displayCartItems();
});
