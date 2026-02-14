
let users = JSON.parse(localStorage.getItem("users")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function save(){
    localStorage.setItem("users",JSON.stringify(users));
    localStorage.setItem("products",JSON.stringify(products));
    localStorage.setItem("cart",JSON.stringify(cart));
}

/* AUTH SYSTEM */

function register(){
    if(!email.value || !password.value) return alert("Fill all fields");

    if(users.find(u=>u.email===email.value))
        return alert("User already exists");

    users.push({
        email:email.value,
        password:password.value,
        role:role.value
    });

    save();
    alert("Registered Successfully");
}

function login(){
    let user=users.find(u=>u.email===email.value && u.password===password.value && u.role===role.value);

    if(!user) return alert("Invalid Credentials");

    localStorage.setItem("session",JSON.stringify(user));

    if(user.role==="admin"){
        window.location.href="admin.html";
    }else{
        window.location.href="user.html";
    }
}

function logout(){
    localStorage.removeItem("session");
    window.location.href="index.html";
}

function protect(role){
    let session=JSON.parse(localStorage.getItem("session"));
    if(!session || session.role!==role){
        window.location.href="index.html";
    }
}

/* PAGE PROTECTION */
if(window.location.pathname.includes("admin.html")) protect("admin");
if(window.location.pathname.includes("user.html")) protect("user");
if(window.location.pathname.includes("checkout.html")) protect("user");

/* IMAGE CONVERT */

function convertToBase64(file){
    return new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.readAsDataURL(file);
        reader.onload=()=>resolve(reader.result);
        reader.onerror=error=>reject(error);
    });
}

/* ADMIN */

async function addProduct(){
    let file=document.getElementById("imageFile").files[0];
    if(!file) return alert("Upload image");

    let base64=await convertToBase64(file);

    products.push({
        id:Date.now(),
        name:name.value,
        category:category.value,
        price:Number(price.value),
        quantity:Number(quantity.value),
        image:base64
    });

    save();
    location.reload();
}

function renderAdmin(){
    if(!document.getElementById("adminProducts")) return;

    adminProducts.innerHTML="";
    products.forEach(p=>{
        adminProducts.innerHTML+=`
<div class="card glass">
<img src="₹{p.image}" class="h-32 w-full object-cover rounded mb-2">
<input value="₹{p.name}" onchange="updateProduct(₹{p.id},'name',this.value)" class="input mb-2 w-full">
<input value="₹{p.category}" onchange="updateProduct(₹{p.id},'category',this.value)" class="input mb-2 w-full">
<input value="₹{p.price}" type="number" onchange="updateProduct(₹{p.id},'price',this.value)" class="input mb-2 w-full">
<input value="₹{p.quantity}" type="number" onchange="updateProduct(₹{p.id},'quantity',this.value)" class="input mb-2 w-full">
<button onclick="deleteProduct(₹{p.id})" class="bg-red-600 px-3 py-1 rounded">Delete</button>
</div>`;
    });
}

function updateProduct(id,key,value){
    let p=products.find(x=>x.id===id);
    p[key]= key==="price"||key==="quantity"?Number(value):value;
    save();
}

function deleteProduct(id){
    products=products.filter(p=>p.id!==id);
    save();
    location.reload();
}

/* USER */

function renderUser(){
    if(!document.getElementById("categories")) return;

    let grouped={};
    products.forEach(p=>{
        if(!grouped[p.category]) grouped[p.category]=[];
        grouped[p.category].push(p);
    });

    categories.innerHTML="";
    for(let cat in grouped){
        categories.innerHTML+=`<h2 class="text-xl text-[#007BFF] mt-6 mb-3">${cat}</h2>
<div class="grid md:grid-cols-3 gap-6">
${grouped[cat].map(p=>`
<div class="card glass">
<img src="${p.image}" class="h-40 w-full object-cover rounded mb-2">
<h3>${p.name}</h3>
<p>₹${p.price}</p>
<button onclick="addToCart(${p.id})" class="btn mt-2 w-full">Add to Cart</button>
</div>`).join("")}
</div>`;
    }
    updateCartBadge();
}

function addToCart(id){
    let item=cart.find(x=>x.id===id);
    if(item){ item.qty++; }
    else{
        let p=products.find(x=>x.id===id);
        cart.push({...p,qty:1});
    }
    save();
    updateCartBadge();
}

function updateCartBadge(){
    if(!document.getElementById("cartCount")) return;
    cartCount.textContent=cart.reduce((a,b)=>a+b.qty,0);
}

function goCheckout(){
    window.location.href="checkout.html";
}

/* CHECKOUT */

function renderCheckout(){
    if(!document.getElementById("checkoutItems")) return;

    let subtotal=0;
    checkoutItems.innerHTML="";
    cart.forEach(p=>{
        subtotal+=p.price*p.qty;
        checkoutItems.innerHTML+=`
<div class="card glass mb-3">
${p.name} x ${p.qty} - ₹${p.price*p.qty}
</div>`;
    });

    let gst=subtotal*0.05;
    let total=subtotal+gst+30;

    document.getElementById("subtotal").textContent=subtotal;
    document.getElementById("gst").textContent=gst;
    document.getElementById("total").textContent=total;
}

function placeOrder(){
    alert("Order Placed Successfully!");
    cart=[];
    save();
    window.location.href="user.html";
}

/* INIT */
renderAdmin();
renderUser();
renderCheckout();
