// SDK DE ARMAZENAMENTO OFFLINE E SINCRONIZAÇÃO EM LOTE (Google Cloud - Holanda)

const CloudSyncSDK = {
    db: null,
    // Endpoint fictício apontando para a infraestrutura do Google Cloud na Europa (Holanda)
    cloudEndpoint: "https://europe-west4-seu-projeto.cloudfunctions.net/sync-lote", 

    init: function() {
        const request = indexedDB.open("ClassroomGamificationDB", 2);
        
        request.onupgradeneeded = (e) => {
            this.db = e.target.result;
            if (!this.db.objectStoreNames.contains("jogos")) {
                this.db.createObjectStore("jogos", { keyPath: "id" });
            }
            if (!this.db.objectStoreNames.contains("progresso_alunos")) {
                this.db.createObjectStore("progresso_alunos", { keyPath: "id", autoIncrement: true });
            }
        };
        
        request.onsuccess = (e) => {
            this.db = e.target.result;
            console.log("📦 SDK: Banco de dados local (IndexedDB) pronto!");
            this.tentarSincronizarEmLote(); // Tenta sincronizar se houver internet
        };
    },

    // Função que os jogos chamam para salvar os dados offline
    salvarProgressoLocal: function(dados) {
        const tx = this.db.transaction(["progresso_alunos"], "readwrite");
        const store = tx.objectStore("progresso_alunos");
        
        dados.sincronizado = false; // Marca como pendente de envio
        dados.timestamp = Date.now();
        store.add(dados);
        
        tx.oncomplete = () => {
            console.log("💾 SDK: Progresso salvo offline com sucesso.");
            this.tentarSincronizarEmLote();
        };
    },

    // Envia os dados acumulados de uma só vez para a nuvem
    tentarSincronizarEmLote: async function() {
        if (!navigator.onLine) {
            console.log("📴 SDK: Offline. Os dados serão enviados quando a internet voltar.");
            return;
        }

        const tx = this.db.transaction(["progresso_alunos"], "readonly");
        const store = tx.objectStore("progresso_alunos");
        const request = store.getAll();

        request.onsuccess = async (e) => {
            const pendentes = e.target.result.filter(item => !item.sincronizado);
            if (pendentes.length === 0) return;

            console.log(`🚀 SDK: Enviando lote de ${pendentes.length} registros para o Google Cloud (Holanda)...`);

            try {
                // Aqui entraria o fetch real para a sua Cloud Function
                // Simulando um envio bem-sucedido:
                setTimeout(() => {
                    this.marcarComoSincronizado(pendentes);
                    console.log("☁️ SDK: Sincronização em lote concluída com sucesso!");
                }, 1500);

            } catch (error) {
                console.error("❌ SDK: Erro na sincronização. Tentaremos novamente depois.", error);
            }
        };
    },

    marcarComoSincronizado: function(registros) {
        const tx = this.db.transaction(["progresso_alunos"], "readwrite");
        const store = tx.objectStore("progresso_alunos");
        registros.forEach(registro => {
            registro.sincronizado = true;
            store.put(registro);
        });
    }
};

// Iniciar o SDK e o Service Worker para garantir que vira uma App Instalável
window.addEventListener('load', () => {
    CloudSyncSDK.init();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(() => {
            console.log('⚙️ Service Worker ativado. Plataforma pronta para instalar!');
        });
    }
});

// Se a internet cair e voltar, ele tenta enviar os dados automaticamente
window.addEventListener('online', () => CloudSyncSDK.tentarSincronizarEmLote());
