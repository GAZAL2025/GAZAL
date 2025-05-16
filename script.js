// استيراد Firebase SDK اللازمة
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

let products = []; // سنملأها من Firestore
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// تحميل المنتجات من Firestore وعرضها
async function loadProducts() {
  const container = document.getElementById('productList');
  if (!container) return;

  container.innerHTML = '';
  products = []; // تفريغ القائمة قبل التعبئة

  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach(docSnap => {
    const product = { id: docSnap.id, ...docSnap.data() };
    products.push(product);

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

// إضافة منتج جديد مع رفع صورة إلى Firebase Storage
async function addProduct() {
  const name = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const imageInput = document.getElementById('productImage');
  const file = imageInput.files[0];

  if (!name || isNaN(price) || !file) {
    alert("يرجى إدخال كل البيانات.");
    return;
  }

  try {
    // رفع الصورة إلى Storage
    const storageRef = ref(storage, `product_images/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    // إضافة المنتج إلى Firestore
    const docRef = await addDoc(collection(db, "products"), {
      name,
      price,
      image: imageUrl
    });

    alert("تم إضافة المنتج بنجاح!");
    // إعادة تحميل المنتجات
    loadProducts();

    // إعادة تعيين الحقول
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    imageInput.value = '';

  } catch (error) {
    alert("حدث خطأ أثناء إضافة المنتج: " + error.message);
  }
}

// حذف المنتج من Firestore
async function deleteProduct(productId) {
  try {
    await deleteDoc(doc(db, "products", productId));

    // حذف المنتج من السلة إن كان موجود
    cart = cart.filter(p => p.id !== productId);
    saveCart();

    // إعادة تحميل المنتجات والسلة
    loadProducts();
    displayCartItems();
  } catch (error) {
    alert("خطأ في حذف المنتج: " + error.message);
  }
}

// إضافة منتج للسلة (محليًا فقط)
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

// إزالة منتج من السلة
function removeFromCart(productId) {
  cart = cart.filter(p => p.id !== productId);
  saveCart();
  displayCartItems();
}

// حفظ السلة في localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// العد التنازلي (كما في السابق)
const eventDate = new Date("2025-05-21T10:00:00");
function updateCountdown() {
  const countdownEl = document.getElementById("countdown");
  if (!countdownEl) return;

  const now = new Date();
  const diff = eventDate - now;

  if (diff <= 0) {
    countdownEl.innerText = "لقد بدأ الحدث!";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownEl.innerText = `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
}

// القائمة المنسدلة للهاتف
function toggleMenu() {
  const menu = document.getElementById("navMenu");
  if (menu) {
    menu.classList.toggle("show");
  }
}

// تحميل تلقائي عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  displayCartItems();

  if (document.getElementById('countdown')) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
});
