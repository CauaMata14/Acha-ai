# 📱 AchaAí – Achados e Perdidos do Campus

O **AchaAí** é um aplicativo mobile desenvolvido em **React Native (Expo)** que conecta quem encontrou um objeto no campus a quem o perdeu. Quem acha tira uma foto, marca o local e publica; quem perdeu pesquisa por categoria ou local e entra em contato com quem encontrou para combinar a devolução.

> Projeto final da disciplina de **Programação para Dispositivos Móveis – IESB**.

## 🎯 Problema e público-alvo

No campus, objetos perdidos (carteiras, chaves, garrafas, fones, documentos) raramente voltam ao dono, porque não existe um canal centralizado entre quem perdeu e quem encontrou. O AchaAí resolve isso reunindo todas as publicações em um único lugar, acessível pelo celular.

**Público-alvo:** alunos, professores e funcionários da instituição.

## ✨ Funcionalidades

- 🔐 Cadastro e login de usuários (Firebase Auth)
- 📸 Publicação de item achado ou perdido com foto (câmera ou galeria)
- 📍 Registro do local do item (GPS ou ponto do campus)
- 📰 Feed de itens em tempo real
- 🔎 Busca e filtros por categoria, tipo e local
- 📄 Tela de detalhes do item
- 💬 Contato com quem publicou
- 👤 Perfil com minhas publicações (editar, remover e marcar como devolvido)

## 🖼️ Telas

> Adicionar as capturas de tela ou GIFs na pasta `docs/screenshots` e atualizar os caminhos abaixo.

| Login | Feed | Publicar item |
|:-----:|:----:|:-------------:|
| ![Login](docs/screenshots/login.png) | ![Feed](docs/screenshots/feed.png) | ![Publicar](docs/screenshots/publicar.png) |

| Detalhes | Perfil |
|:--------:|:------:|
| ![Detalhes](docs/screenshots/detalhes.png) | ![Perfil](docs/screenshots/perfil.png) |

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|-----------|------------|
| Framework | React Native + Expo |
| Navegação | Expo Router (Native Stack + Bottom Tabs) |
| Estado global | Context API |
| Backend / Banco NoSQL | Firebase Firestore |
| Autenticação | Firebase Auth |
| Recursos nativos | expo-image-picker (câmera/galeria), expo-location (GPS), DateTimePicker |
| Ícones | @expo/vector-icons |

## 📂 Estrutura de pastas

```
Acha-ai/
├── app/                # Rotas (Expo Router)
│   ├── (auth)/         # Login e cadastro (Stack)
│   ├── (tabs)/         # Feed, Publicar e Perfil (Bottom Tabs)
│   └── item/[id].tsx   # Detalhes do item
├── components/         # Componentes reutilizáveis (Button, Input, ItemCard, Loading)
├── contexts/           # Estado global (AuthContext)
├── services/           # Configuração e funções do Firebase
├── hooks/              # Hooks personalizados
├── assets/             # Imagens e ícones
└── docs/screenshots/   # Capturas de tela do README
```

## 🚀 Como executar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [Git](https://git-scm.com/)
- App **Expo Go** no celular (Android / iOS) ou um emulador Android/iOS

### 1. Clonar o repositório

```bash
git clone https://github.com/CauaMata14/Acha-ai.git
cd Acha-ai
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar o Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um projeto de teste.
2. Em **Build → Firestore Database**, crie o banco em modo de teste.
3. Em **Build → Authentication**, ative o provedor **E-mail/senha**.
4. Em **Configurações do projeto → Seus apps**, adicione um app **Web** e copie as credenciais.
5. Na raiz do projeto, copie o arquivo de exemplo e preencha com suas chaves:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

> ⚠️ O arquivo `.env` está no `.gitignore` e **não deve** ser enviado ao repositório.

### 4. Iniciar o app

```bash
npx expo start
```

- Escaneie o QR Code com o **Expo Go** (Android) ou com a câmera (iOS), ou
- Pressione `a` para abrir no emulador Android / `i` para o simulador iOS.

## 🔀 Fluxo de trabalho (Git Flow)

| Branch | Uso |
|--------|-----|
| `main` | Versão estável de entrega |
| `develop` | Integração das funcionalidades |
| `feature/*` | Uma branch por funcionalidade (ex.: `feature/auth-telas`) |

1. Cada tarefa é uma **issue** no quadro do projeto.
2. A branch `feature/...` é criada a partir da `develop`.
3. Ao finalizar, abre-se um **Pull Request** para a `develop` com `Closes #número-da-issue`.
4. Outro integrante revisa e aprova antes do merge.
5. Ao final de cada entrega, a `develop` é mesclada na `main`.

**Padrão de commits:** `feat:` nova funcionalidade · `fix:` correção · `style:` ajustes visuais · `docs:` documentação · `chore:` configuração

## 👥 Integrantes

- Cauã Mata
- Gustavo Domingos
- Marcus Vinicius
