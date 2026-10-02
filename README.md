# Biblioteca de Jogos Educacionais — Firebase + GitHub

Sistema pessoal para organizar jogos educacionais em HTML por componente curricular.

## O que já está implementado

- Acesso restrito a um único e-mail.
- Login com Google via Firebase Authentication.
- Capas para componentes curriculares.
- Inclusão e retirada de componentes.
- Ambiente próprio para cada componente.
- Inclusão e retirada de jogos.
- Upload de jogos `.html` para Firebase Storage.
- Metadados no Firestore.
- Abertura do jogo dentro de um ambiente próprio.
- Estrutura pronta para versionamento/publicação pelo GitHub.
- O mesmo projeto pode receber Língua Portuguesa, Ciências, Biologia, Matemática, História, Geografia, Educação Física etc.

## Importante sobre Firebase x Firestore

O arquivo HTML do jogo não deve ser colocado diretamente em um documento Firestore. Nesta arquitetura:

- Firestore = catálogo e metadados.
- Firebase Storage = arquivo HTML e capas.
- GitHub = código, versionamento e publicação.

## Configuração

1. Crie um projeto no Firebase.
2. Ative Authentication > Google.
3. Cadastre seu e-mail como usuário autorizado.
4. Crie Firestore Database.
5. Ative Storage.
6. Copie `firebase-config.js.example` para `firebase-config.js` e preencha os dados do seu projeto.
7. Em `app.js` e `component.js`, substitua `SEU_EMAIL_AQUI@EXEMPLO.COM`.
8. Publique `firestore.rules` e `storage.rules`.
9. Coloque os arquivos em um repositório GitHub.
10. Para hospedagem, use GitHub Pages ou Firebase Hosting.

## Integração com GitHub

O GitHub não deve receber um Personal Access Token dentro do navegador. Para sincronizar automaticamente os jogos enviados para o Firebase com um repositório GitHub, a próxima etapa deve usar uma Cloud Function/Actions com segredo no ambiente do servidor.

A estrutura deste pacote deixa a biblioteca pronta para essa integração sem expor o token.

## Estrutura

- `index.html` — biblioteca principal.
- `component.html` — jogos de um componente.
- `play.html` — execução do jogo.
- `app.js` — componentes e autenticação.
- `component.js` — upload/remoção de jogos.
- `firebase-config.js.example` — configuração.
- `firestore.rules` — segurança.
- `storage.rules` — segurança.
