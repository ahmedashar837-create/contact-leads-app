import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// YAHAN APNA FIREBASE CONFIG PASTE KARO
    const firebaseConfig = {
      apiKey: "AIzaSyBHB1qwexR7GCykxp_9r6YOhrAZ4MbCP-o",
      authDomain: "my-first-project-50147.firebaseapp.com",
      databaseURL: "https://my-first-project-50147-default-rtdb.firebaseio.com",
      projectId: "my-first-project-50147",
      storageBucket: "my-first-project-50147.firebasestorage.app",
      messagingSenderId: "746770459559",
      appId: "1:746770459559:web:6c0b03f1764566a08e2482"
    };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const leadForm = document.getElementById("leadForm");
const statusEl = document.getElementById("status");
const leadsList = document.getElementById("leadsList");
const refreshBtn = document.getElementById("refreshBtn");

async function fetchLeads() {
  leadsList.innerHTML = `<p class="empty">Loading leads...</p>`;

  try {
    const snapshot = await getDocs(collection(db, "leads"));

    if (snapshot.empty) {
      leadsList.innerHTML = `<p class="empty">No leads found.</p>`;
      return;
    }

    const leads = [];

    snapshot.forEach((item) => {
      leads.push({
        id: item.id,
        ...item.data()
      });
    });

    leads.sort((a, b) => {
      const aTime = a.created_at?.seconds || 0;
      const bTime = b.created_at?.seconds || 0;
      return bTime - aTime;
    });

    let html = "";

    leads.forEach((lead) => {
      let createdAtText = "Just now";

      if (lead.created_at && lead.created_at.toDate) {
        createdAtText = lead.created_at.toDate().toLocaleString();
      }

      html += `
        <div class="lead-item">
          <h3>${escapeHtml(lead.name || "")}</h3>
          <p><strong>Email:</strong> ${escapeHtml(lead.email || "")}</p>
          <p><strong>Message:</strong> ${escapeHtml(lead.message || "")}</p>
          <small>${createdAtText}</small>
          <button class="delete-btn" data-id="${lead.id}">Delete</button>
        </div>
      `;
    });

    leadsList.innerHTML = html;
    attachDeleteEvents();
  } catch (error) {
    leadsList.innerHTML = `<p class="empty">Fetch error: ${error.message}</p>`;
    console.error("Fetch error:", error);
  }
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");

      try {
        statusEl.className = "info";
        statusEl.textContent = "Deleting...";

        await deleteDoc(doc(db, "leads", id));

        statusEl.className = "success";
        statusEl.textContent = "Lead deleted successfully.";
        fetchLeads();
      } catch (error) {
        statusEl.className = "error";
        statusEl.textContent = "Delete error: " + error.message;
        console.error("Delete error:", error);
      }
    });
  });
}

leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !email || !message) {
    statusEl.className = "error";
    statusEl.textContent = "Please fill all fields.";
    return;
  }

  if (!emailPattern.test(email)) {
    statusEl.className = "error";
    statusEl.textContent = "Please enter a valid email address.";
    return;
  }

  try {
    statusEl.className = "info";
    statusEl.textContent = "Submitting...";

    await addDoc(collection(db, "leads"), {
      name,
      email,
      message,
      created_at: serverTimestamp()
    });

    statusEl.className = "success";
    statusEl.textContent = "Lead submitted successfully.";
    leadForm.reset();

    fetchLeads();
  } catch (error) {
    statusEl.className = "error";
    statusEl.textContent = "Submit error: " + error.message;
    console.error("Submit error:", error);
  }
});

refreshBtn.addEventListener("click", fetchLeads);

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

fetchLeads();