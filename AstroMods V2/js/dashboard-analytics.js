import {
db,
collection,
getDocs
}
from "./firebase-init.js";

async function loadDashboard(){

const users =
await getDocs(
collection(db,"users")
);

document.getElementById(
"totalUsers"
).textContent =
users.size;

const mods =
await getDocs(
collection(db,"mods")
);

document.getElementById(
"totalMods"
).textContent =
mods.size;

let vipCount = 0;

users.forEach((userDoc)=>{

const user =
userDoc.data();

if(user.vipStatus){

vipCount++;

}

});

document.getElementById(
"totalVIP"
).textContent =
vipCount;

}

loadDashboard();