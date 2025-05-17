// Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD7H0KEqtBx4TFQX80jFbYbnoiN8HBOUD0",
  authDomain: "ghazal-2025.firebaseapp.com",
  projectId: "ghazal-2025",
  storageBucket: "ghazal-2025.appspot.com",
  messagingSenderId: "991237133972",
  appId: "1:991237133972:web:ee881d54f94e7d20690681"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsRef = collection(db, "products");

// عرض المنتجات
async function displayProducts() {
  const container = document.getElementById("productList");
  if (!container) return;

  container.innerHTML = "";
  const snapshot = await getDocs(productsRef);

  snapshot.forEach((docSnap) => {
    const product = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${product.image}" width="100" />
      <h3>${product.name}</h3>
      <p>السعر: ${product.price} ريال</p>
      <button onclick="addToCart('${id}', '${product.name}', '${product.price}', '${product.image}')">أضف إلى السلة</button>
      <button onclick="deleteProduct('${id}')">حذف المنتج</button>
    `;
    container.appendChild(div);
  });
}

// إضافة منتج جديد
async function addProduct() {
  const name = document.getElementById("productName").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const imageInput = document.getElementById("productImage");
  const file = imageInput.files[0];

  if (!name || isNaN(price) || !file) {
    alert("يرجى إدخال كل البيانات.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function (e) {
    const imageBase64 = e.target.result;

    await addDoc(productsRef, {
      name,
      price,
      image: imageBase64
    });

    displayProducts();
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    imageInput.value = "";
  };
  reader.readAsDataURL(file);
}

// حذف منتج
async function deleteProduct(productId) {
  await deleteDoc(doc(db, "products", productId));
  displayProducts();
}

// السلة محلياً (بدون Firestore)
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id, name, price, image) {
  const existing = cart.find(p => p.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, name, price: parseFloat(price), image, quantity: 1 });
  }
  saveCart();
  alert("تمت إضافة المنتج إلى السلة");
}

function displayCartItems() {
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("totalPrice");
  if (!container || !totalEl) return;

  container.innerHTML = "";
  let total = 0;

  cart.forEach(product => {
    const div = document.createElement("div");
    div.className = "cart-item";
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

function removeFromCart(id) {
  cart = cart.filter(p => p.id !== id);
  saveCart();
  displayCartItems();
}

// العد التنازلي
const eventDate = new Date("2025-05-21T10:00:00");
function updateCountdown() {
  const el = document.getElementById("countdown");
  if (!el) return;

  const now = new Date();
  const diff = eventDate - now;

  if (diff <= 0) {
    el.innerText = "لقد بدأ الحدث!";
    return;
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  el.innerText = `${d} يوم ${h} ساعة ${m} دقيقة ${s} ثانية`;
}

// تشغيل تلقائي
document.addEventListener("DOMContentLoaded", () => {
  displayProducts();
  displayCartItems();

  if (document.getElementById("countdown")) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
});

// القائمة الجانبية
function toggleMenu() {
  const menu = document.getElementById("navMenu");
  if (menu) menu.classList.toggle("show");
}
