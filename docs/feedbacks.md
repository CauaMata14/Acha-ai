# Guia de feedbacks visuais (#17)

Padrão para todas as telas do AchaAí. Use sempre estes componentes em vez de criar estilos novos.

| Situação | Componente | Exemplo |
| --- | --- | --- |
| Carregando a tela inteira | `<Loading mensagem="..." />` | Abrindo detalhes, carregando o feed |
| Carregando uma ação (botão) | `<Button carregando={true} />` | Entrar, Publicar, Salvar |
| Erro de formulário ou de envio | `<Alerta tipo="erro" mensagem="..." />` | Senha incorreta, falha ao publicar |
| Sucesso que fica na tela | `<Alerta tipo="sucesso" mensagem="..." />` | Conta criada, item devolvido |
| Aviso/informação fixa | `<Alerta tipo="aviso" />` / `<Alerta tipo="info" />` | "Esta publicação é sua" |
| Confirmação rápida após uma ação | `toast.sucesso('...')` | Item publicado, item removido |
| Erro rápido após uma ação | `toast.erro('...')` | Não foi possível abrir o e-mail |
| Lista vazia / busca sem resultado | `<EstadoVazio titulo="..." acao={...} />` | Nenhum item publicado ainda |
| Falha ao carregar dados | `<EstadoErro onTentarNovamente={...} />` | Sem internet, erro no Firestore |
| Erro em um campo | `<Input erro="..." />` | "Informe o título." |

## Toast (estado global)

O `ToastProvider` fica no `app/_layout.tsx`, então qualquer tela pode usar:

```tsx
import { useToast } from '@/hooks/useToast';

const toast = useToast();
toast.sucesso('Item publicado com sucesso!');
toast.erro('Não foi possível salvar o item.');
toast.info('Você saiu da sua conta.');
```

## Fluxo padrão de uma tela que carrega dados

```tsx
if (carregando) return <Loading mensagem="Carregando itens..." />;
if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />;
if (itens.length === 0) return <EstadoVazio titulo="Nenhum item por aqui" />;
return <FlatList ... />;
```
