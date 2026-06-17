import {
    db,
    collection,
    getDocs,
    doc,
    updateDoc
}
    from "./firebase-init.js";

async function loadUsers() {

    async function makeVIP(uid) {

        await updateDoc(
            doc(db, "users", uid),
            {
                vip: true
            }
        );

        alert("User sekarang VIP!");

        loadUsers();

    }

    const usersContainer =
        document.getElementById("usersContainer");

    usersContainer.innerHTML = "";

    const snapshot =
        await getDocs(
            collection(db, "users")
        );

    snapshot.forEach((docData) => {

        const user =
            docData.data();

        usersContainer.innerHTML += `

<div class="user-card">

<h3>
${user.displayName || "Unknown"}
</h3>

<p>
${user.email || ""}
</p>

<p>
Role:
${user.role || "user"}
</p>

<p>
VIP:
${user.vip ? "Yes" : "No"}
</p>

<button>
Promote Admin
</button>

<button
onclick="makeVIP('${docData.id}')">

⭐ Make VIP

</button>

</div>

`;

    });

}

loadUsers();

window.makeVIP = makeVIP;