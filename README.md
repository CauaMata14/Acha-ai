# 📱 AchaAí – Achados e Perdidos do Campus

O **AchaAí** é um aplicativo mobile desenvolvido em **React Native (Expo)** que conecta quem encontrou um objeto no campus a quem o perdeu. Quem acha tira uma foto, marca o local e publica; quem perdeu pesquisa por categoria, tipo ou palavra-chave e fala com quem encontrou (WhatsApp ou e-mail) para combinar a devolução.

> Projeto final da disciplina de **Programação para Dispositivos Móveis – IESB**.

- 📋 **Quadro de tarefas:** [GitHub Projects](https://github.com/users/CauaMata14/projects/4)

## 🎯 Problema e público-alvo

No campus, objetos perdidos (carteiras, chaves, garrafas, fones, documentos) raramente voltam ao dono, porque não existe um canal centralizado entre quem perdeu e quem encontrou. O AchaAí resolve isso reunindo todas as publicações em um único lugar, acessível pelo celular.

**Público-alvo:** alunos, professores e funcionários da instituição.

## ✨ Funcionalidades

- 🔐 **Cadastro e login** com Firebase Auth, com a sessão salva no aparelho
- 📸 **Publicar item achado ou perdido** com foto da câmera ou da galeria (comprimida antes de enviar)
- 📍 **Local do item** por texto, por ponto do campus ou pelo GPS do celular
- 📅 **Data da ocorrência** escolhida no calendário nativo (DateTimePicker)
- 📰 **Feed em tempo real**: novas publicações aparecem sozinhas, com carregamento aos poucos e "puxar para atualizar"
- 🔎 **Busca e filtros** por palavra-chave (título, descrição, local), tipo (achado/perdido) e categoria
- 📄 **Detalhes do item** com foto ampliada em tela cheia, mapa do local e botão de compartilhar
- 💬 **Contato com quem publicou** por WhatsApp ou e-mail, com mensagem pronta
- 👤 **Perfil com minhas publicações**: editar, marcar como devolvido e remover
- 🔔 **Feedback visual** em todas as telas: carregamento, mensagens de erro e sucesso, estados vazios e aviso de sem conexão

## ✅ Requisitos do projeto

| Requisito | Como o AchaAí atende |
|-----------|----------------------|
| Componentização e Flexbox | Mais de 20 componentes reutilizáveis em `components/` (`Button`, `Input`, `ItemCard`, `FormularioItem`, `EstadoVazio`...), todos os layouts em Flexbox |
| UI/UX com feedback visual | Spinners e esqueleto de carregamento, `Toast` e `Alerta` para erro/sucesso, estados vazios e de erro com ação ([guia](docs/feedbacks.md)) |
| Navegação com múltiplos navegadores | Expo Router: **Stack** (login, cadastro, detalhes, editar) + **Bottom Tabs** (Feed, Publicar, Perfil), com redirecionamento conforme o login |
| Estado local e eventos | `useState`, `useReducer`, `useEffect` com listeners em tempo real, eventos de toque, rolagem e teclado |
| Estado global | Context API: `AuthContext` (usuário logado) e `ToastContext` (notificações em qualquer tela) |
| Formulários com validação | Login, cadastro, publicar e editar, com mensagens por campo (`utils/validacao.ts`) |
| Recursos nativos | Câmera e galeria, GPS, DateTimePicker, abrir WhatsApp/e-mail/mapa e compartilhar |
| Ícones vetoriais | `@expo/vector-icons` (Ionicons) |
| Firebase (NoSQL) | Firestore com **leitura** (tempo real), **gravação**, **edição** e **remoção**; regras de segurança em [`firestore.rules`](firestore.rules) |
| Autenticação (diferencial) | Firebase Auth com e-mail e senha |
| Git Flow | `main`, `develop` e `feature/*`, Pull Requests com revisão de outro integrante antes do merge |

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|-----------|------------|
| Framework | React Native 0.88 + Expo SDK 58 + TypeScript |
| Navegação | Expo Router (Native Stack + Bottom Tabs) |
| Estado global | Context API |
| Backend / Banco NoSQL | Firebase Firestore |
| Autenticação | Firebase Auth (sessão salva com AsyncStorage) |
| Recursos nativos | expo-image-picker e expo-image-manipulator (foto), expo-location (GPS), @react-native-community/datetimepicker (data) |
| Ícones | @expo/vector-icons |

## 📂 Estrutura de pastas

```
Acha-ai/
├── app/                   # Rotas (Expo Router)
│   ├── (auth)/            # Login e cadastro (Stack)
│   ├── (tabs)/            # Feed, Publicar e Perfil (Bottom Tabs)
│   ├── item/[id].tsx      # Detalhes do item
│   ├── editar/[id].tsx    # Editar publicação
│   └── index.tsx          # Redireciona para o login ou para as abas
├── components/            # Componentes reutilizáveis
├── constants/             # Cores e categorias
├── contexts/              # Estado global (AuthContext, ToastContext)
├── hooks/                 # useAuth, useToast e hooks auxiliares
├── services/              # Firebase, itens, foto, localização e contato
├── types/                 # Tipos do modelo de dados (Item)
├── utils/                 # Validação, formatação e filtros
├── docs/                  # Protótipos das telas e guia de feedbacks
└── firestore.rules        # Regras de segurança do Firestore
```

## 🚀 Como executar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 22.13 ou superior (exigido pelo Expo SDK 58)
- [Git](https://git-scm.com/)
- App **Expo Go compatível com o SDK 58** no celular (Android / iOS), ou um emulador Android/iOS
  - Se a loja ainda não tiver a versão para o SDK 58, baixe em [expo.dev/go](https://expo.dev/go). Uma versão antiga mostra o erro *"Project is incompatible with this version of Expo Go"*.

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
2. Em **Build → Authentication**, ative o provedor **E-mail/senha**.
3. Em **Build → Firestore Database**, crie o banco. Na aba **Regras**, cole o conteúdo do arquivo [`firestore.rules`](firestore.rules) e clique em **Publicar**. Com essas regras:
   - só usuários logados leem os itens;
   - cada um publica apenas em seu próprio nome, e todo item nasce com o status "aberto";
   - só o autor edita ou remove o que publicou;
   - os campos precisam seguir os mesmos limites do formulário.
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
npx expo start -c
```

> O `-c` limpa o cache do Metro. Use-o sempre que alterar o `.env`, senão as variáveis novas não são carregadas.

- Escaneie o QR Code com o **Expo Go** (Android) ou com a câmera (iOS), ou
- Pressione `a` para abrir no emulador Android / `i` para o simulador iOS.

> 📶 Se o celular mostrar *"Failed to download remote update"*, o celular não está alcançando o computador (redes diferentes, Wi-Fi da faculdade ou firewall). Rode com túnel: `npx expo start -c --tunnel`.

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

## 👥 Integrantes e divisão de tarefas

| Integrante | GitHub | Responsabilidades (issues) |
|------------|--------|----------------------------|
| Cauã Mata | [@CauaMata14](https://github.com/CauaMata14) | #1 Setup do projeto · #2 Firebase · #3 Git Flow · #4 Login e cadastro · #5 AuthContext · #6 Navegação · #11 Salvar item no Firestore · #12 Feed em tempo real · #14 Detalhes (foto ampliada e compartilhar) · #15 Contato · #17 Feedbacks visuais · #18 README |
| Gustavo Domingos | [@Gustavo0320IESB](https://github.com/Gustavo0320IESB) | #7 Componentes reutilizáveis · #8 Formulário de publicar com validação · tela de detalhes do item · guia de feedbacks visuais |
| Marcus Vinicius | [@MarcusBrzerra](https://github.com/MarcusBrzerra) | #9 Foto via câmera/galeria · #10 Localização · #13 Busca e filtros · #16 Perfil: minhas publicações (editar, remover, devolvido) |
