import { auth, db, storage } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const ALLOWED_EMAIL = "SEU_EMAIL_AQUI@EXEMPLO.COM";
const params = new URLSearchParams(location.search);
const subjectId = params.get("id");
const $ = id => document.getElementById(id);

$("btnAddGame").onclick = () => $("gameModal").classList.remove("hidden");
document.querySelectorAll("[data-close]").forEach(b => b.onclick = () => $(b.dataset.close).classList.add("hidden"));
$("saveGame").onclick = saveGame;

onAuthStateChanged(auth, async user => {
  if (!user || user.email?.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
    location.href = "index.html"; return;
  }
  if (!subjectId) { location.href = "index.html"; return; }
  const s = await getDoc(doc(db, "subjects", subjectId));
  if (!s.exists()) { location.href = "index.html"; return; }
  $("componentTitle").textContent = s.data().name;
  loadGames();
});

function loadGames() {
  onSnapshot(query(collection(db, "subjects", subjectId, "games"), orderBy("name")), snap => {
    const grid = $("gameGrid"); grid.innerHTML = "";
    snap.forEach(d => {
      const g = d.data();
      const card = document.createElement("article");
      card.className = "game-card";
      card.innerHTML = `
        <div class="game-cover" style="background-image:url('${g.coverUrl || `https://placehold.co/800x500/png?text=${encodeURIComponent(g.name)}`}')"></div>
        <div class="game-body"><h3>${escapeHtml(g.name)}</h3><p>${escapeHtml(g.description || "")}</p>
        <div class="card-actions"><button class="primary play">Abrir jogo</button><button class="danger remove">Retirar</button></div></div>`;
      card.querySelector(".play").onclick = () => location.href = `play.html?id=${encodeURIComponent(d.id)}&subject=${encodeURIComponent(subjectId)}`;
      card.querySelector(".remove").onclick = async () => {
        if (!confirm(`Retirar "${g.name}"?`)) return;
        try { if (g.storagePath) await deleteObject(ref(storage, g.storagePath)); } catch(e) {}
        try { if (g.coverPath) await deleteObject(ref(storage, g.coverPath)); } catch(e) {}
        await deleteDoc(doc(db, "subjects", subjectId, "games", d.id));
      };
      grid.appendChild(card);
    });
  });
}

async function saveGame() {
  const name = $("gameName").value.trim();
  const file = $("gameFile").files[0];
  const cover = $("gameCover").files[0];
  if (!name || !file) return alert("Informe o nome e selecione o arquivo HTML.");
  if (!/\.html?$/i.test(file.name)) return alert("Selecione um arquivo HTML.");
  const status = $("uploadStatus");
  try {
    $("saveGame").disabled = true; status.textContent = "Enviando jogo...";
    const safe = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
    const htmlPath = `games/${subjectId}/${safe}`;
    const htmlRef = ref(storage, htmlPath);
    await uploadBytes(htmlRef, file, {contentType:"text/html;charset=utf-8"});
    const htmlUrl = await getDownloadURL(htmlRef);

    let coverUrl = "", coverPath = "";
    if (cover) {
      coverPath = `game-covers/${subjectId}/${Date.now()}_${cover.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
      const coverRef = ref(storage, coverPath);
      await uploadBytes(coverRef, cover);
      coverUrl = await getDownloadURL(coverRef);
    }

    const game = { name, description:$("gameDescription").value.trim(), htmlUrl, storagePath:htmlPath, coverUrl, coverPath, createdAt:serverTimestamp() };
    const docRef = await addDoc(collection(db, "subjects", subjectId, "games"), game);

    // Espelha o cadastro numa coleção global para consultas futuras.
    await addDoc(collection(db, "games"), {...game, subjectId, sourceGameId:docRef.id});

    status.textContent = "Jogo salvo com sucesso.";
    setTimeout(() => $("gameModal").classList.add("hidden"), 700);
    $("gameName").value=""; $("gameDescription").value=""; $("gameFile").value=""; $("gameCover").value="";
  } catch (e) {
    status.textContent = "Erro: " + e.message;
  } finally { $("saveGame").disabled = false; }
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
