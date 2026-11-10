# Rotina Auditor Fiscal — painel de estudos (PWA)

App pessoal, sem login e sem servidor. Todos os dados ficam **no seu aparelho** (localStorage).
Arquivos: `index.html`, `style.css`, `script.js`, `manifest.json`, `service-worker.js` e a pasta `icons/`.

> Importante: PWA só instala e só funciona offline em endereço **HTTPS** (ou localhost).
> Abrir o `index.html` direto do arquivo funciona como página comum, mas sem instalação nem cache offline.

## 1. Hospedar de graça em HTTPS

### Opção A — Netlify Drop (mais simples, sem conta Git)
1. Descompacte o zip no computador. A pasta deve conter o `index.html` na raiz.
2. Acesse **app.netlify.com/drop** e arraste a **pasta inteira** para a página.
3. O Netlify devolve um endereço `https://nome-aleatorio.netlify.app`. Guarde-o (crie conta grátis para manter o site no ar e renomear o endereço).

### Opção B — GitHub Pages
1. Crie um repositório público no GitHub (ex.: `rotina-auditor`) e envie todos os arquivos (Add file → Upload files).
2. Em **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main`, pasta `/ (root)` → Save.
3. Em ~1 minuto o app fica em `https://SEU-USUARIO.github.io/rotina-auditor/`.

### Opção C — Cloudflare Pages
Pages → Create → *Upload assets* → envie a pasta. O endereço será `https://nome.pages.dev`.

## 2. Abrir pelo celular
Digite (ou envie para si mesmo por mensagem) o endereço HTTPS e abra **uma vez com internet**. Nesse primeiro acesso os arquivos são guardados no aparelho.

## 3. Instalar na tela inicial
- **Android (Chrome):** menu ⋮ → *Instalar app* (ou *Adicionar à tela inicial*). Também aparece o botão "Instalar na tela inicial" em **Ajustes**.
- **iPhone (Safari — precisa ser o Safari):** botão Compartilhar → *Adicionar à Tela de Início* → Adicionar.

## 4. Usar offline
Depois do primeiro acesso online, ative o modo avião e abra o app pelo ícone: ele funciona igual (marcar, anotar, histórico, backup). Em **Ajustes** aparece "pronto para uso offline ✔" quando o cache está pronto.
Para atualizar o app no futuro, troque os arquivos no hospedeiro e aumente o número em `CACHE` no `service-worker.js` (ex.: `rotina-auditor-v2`); seus dados não são afetados.

## 5. Backup e restauração
- **Ajustes → Exportar backup (JSON):** salva todos os registros e configurações. Faça isso ao menos 1x por semana e guarde o arquivo no Drive/e-mail.
- **Ajustes → Importar backup:** *substituir tudo* (aparelho novo) ou *mesclar* com o que já existe.
- **Exportar registros (CSV):** abre no Excel/Planilhas (separador ponto e vírgula).
- Atenção: limpar os dados do navegador, desinstalar o app ou trocar de celular apaga os registros locais — o backup JSON é a sua garantia. Os dados do navegador e do app instalado podem ser separados no iPhone; use o backup para levar de um para outro.

## Como o app funciona
- **Hoje:** abre sempre no dia atual. Segunda a sexta = 3 períodos; sábado = painel com cronômetro; domingo = descanso (sem metas).
- Cada atividade: ✓ concluir (registra data e hora), **Parcial**, **Não realizada**, tempo dedicado, observações. Tocar de novo desfaz.
- "Tempo e notas" → o tempo planejado nunca é copiado sozinho para o realizado; use o botão "= X min" se quiser.
- Opcionais (intervalos do trabalho) só entram no percentual do dia se você marcar.
- Datas: use ‹ › ou o calendário no topo para lançar o que fez em outro dia; "Atividades fora da rotina" registra estudos extras.
- **Ajustes:** horários, descrições, ativar/desativar atividades, plano semanal de disciplinas e lista de assuntos (usados nas sugestões das aulas em áudio). A lista de assuntos inicial é genérica — adapte ao seu edital.
- "Rotina cumprida" no Desempenho = dia com 80% ou mais.
