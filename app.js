import { db } from "./firebase-config.js";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const $ = id => document.getElementById(id);
const grid = $("componentGrid");

// A MÁGICA ACONTECE AQUI: Carrega os jogos diretamente para o público sem pedir login!
loadComponents();

// Controlos de adicionar novos jogos/componentes
const btnAdd = $("btnAddComponent");
if(btnAdd) btnAdd.onclick = () => $("componentModal").classList.remove("hidden");

const btnSave = $("saveComponent");
if(btnSave) btnSave.onclick = saveComponent;

document.querySelectorAll("[data-close]").forEach(b => b.onclick = () => $(b.dataset.close).classList.add("hidden"));

function loadComponents() {
  onSnapshot(query(collection(db, "subjects"), orderBy("name")), snap => {
    grid.innerHTML = "";
    snap.forEach(d => {
      const c = d.data();
      const card = document.createElement("article");
      card.className = "component-card";
      card.innerHTML = `
        <div class="cover" style="background-image:url('${escapeAttr(c.cover || defaultCover(c.name))}')">
          <div class="cover-shade"></div><h3>${escapeHtml(c.name)}</h3>
        </div>
        <div class="card-actions">
          <button class="primary open">Abrir jogos</button>
          <button class="danger remove">Retirar</button>
        </div>`;
      card.querySelector(".open").onclick = () => location.href = `component.html?id=${encodeURIComponent(d.id)}`;
      card.querySelector(".remove").onclick = async () => {
        if (confirm(`Retirar "${c.name}"?`)) await deleteDoc(doc(db, "subjects", d.id));
      };
      grid.appendChild(card);
    });
  });
}

async function saveComponent() {
  const name = $("componentName").value.trim();
  if (!name) return alert("Informe o nome do componente.");
  await addDoc(collection(db, "subjects"), {
    name, cover: $("componentCover").value.trim(),
    createdAt: serverTimestamp()
  });
  $("componentName").value = ""; $("componentCover").value = "";
  $("componentModal").classList.add("hidden");
}

function defaultCover(name) {
  return `https://placehold.co/900x600/png?text=${encodeURIComponent(name)}`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function escapeAttr(s){return String(s).replace(/'/g,"%27");}