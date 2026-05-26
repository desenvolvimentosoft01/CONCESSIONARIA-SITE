# Manual do Sistema — Lucas Veículos

> Documento de referência completo para o dono da loja e para desenvolvedores.  
> Última atualização: maio/2026

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Banco de Dados](#2-banco-de-dados)
3. [Site Público — Páginas e Funcionalidades](#3-site-público--páginas-e-funcionalidades)
4. [Painel Administrativo — Guia de Uso](#4-painel-administrativo--guia-de-uso)
5. [CRM — Gestão de Leads](#5-crm--gestão-de-leads)
6. [Notificações WhatsApp](#6-notificações-whatsapp)
7. [Upload de Imagens e Vídeos](#7-upload-de-imagens-e-vídeos)
8. [Auditoria](#8-auditoria)
9. [Personalização do Site](#9-personalização-do-site)
10. [Variáveis de Ambiente](#10-variáveis-de-ambiente)
11. [Fluxos Completos](#11-fluxos-completos)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Visão Geral

### O que é o sistema

O sistema Lucas Veículos é composto por três partes integradas:

- **Site público** — O site que os clientes acessam para ver os veículos à venda, entrar em contato e solicitar financiamento.
- **Painel administrativo** — Área restrita onde o dono da loja gerencia o estoque, as imagens, as cores do site e o histórico de ações.
- **CRM (Gestão de Relacionamento com Clientes)** — Ferramenta que captura automaticamente todos os contatos recebidos (formulários, clique no WhatsApp), organiza os leads em um funil de vendas e envia notificações em tempo real para o dono.

### Tech stack

| Componente | Tecnologia |
|---|---|
| Framework web | Next.js 14 (App Router) |
| Banco de dados | PostgreSQL via biblioteca `pg` |
| Armazenamento de imagens | Cloudinary (CDN) |
| Envio de e-mail | Nodemailer + Gmail SMTP |
| Notificações WhatsApp | Evolution API |
| Hospedagem | Vercel |

### URLs e acesso

| Ambiente | URL |
|---|---|
| Site público | `https://concessionaria-site.vercel.app` |
| Painel admin | `https://concessionaria-site.vercel.app/entrar` |
| Desenvolvimento local | `http://localhost:3000` |

**Credenciais de desenvolvimento:** O login é feito com e-mail e senha cadastrados na tabela `TAB_USUARIO` do banco de dados. Não há usuário padrão pré-criado — o registro deve ser feito diretamente no banco via SQL.

---

## 2. Banco de Dados

O banco de dados é PostgreSQL. Todas as tabelas seguem a convenção de nome `TAB_*`. As queries são feitas diretamente via a função `query()` de `src/lib/db.ts`, sem ORM.

---

### TAB_CARRO

**O que armazena:** Cada veículo do estoque, com suas informações de cadastro.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | integer (PK) | Identificador único do veículo |
| `marca` | text | Marca do carro (ex: Honda, Toyota) |
| `modelo` | text | Modelo do carro (ex: Civic, Corolla) |
| `ano` | integer | Ano de fabricação |
| `cor` | text | Cor do veículo |
| `placa` | text | Placa (opcional) |
| `preco` | numeric | Preço de venda em reais |
| `imagem_url` | text | URL da imagem principal (Cloudinary) |
| `descricao` | text | Texto descritivo do vendedor |
| `disponivel` | boolean | `true` = aparece no site; `false` = oculto/vendido |
| `data_criacao` | timestamp | Data e hora do cadastro |

**Relacionamentos:** Um carro pode ter várias imagens em `TAB_CARRO_IMAGEM` e pode ser vinculado a vários leads em `TAB_LEAD`.

**Como é populada:** Manualmente pelo admin via `/admin/carros/novo`. Quando um lead é movido para a etapa "Ganho", o campo `disponivel` é automaticamente alterado para `false`.

---

### TAB_CARRO_IMAGEM

**O que armazena:** Imagens adicionais de um veículo (galeria). Cada linha é uma foto ou vídeo vinculado a um carro.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | integer (PK) | Identificador |
| `carro_id` | integer (FK) | Referência ao carro em `TAB_CARRO` |
| `imagem_url` | text | URL do arquivo no Cloudinary |
| `ordem` | integer | Posição na galeria (menor = aparece primeiro) |

**Como é populada:** Pelo admin ao cadastrar ou editar um veículo. As imagens são enviadas para o Cloudinary e a URL resultante é salva aqui. Ao deletar um carro, as imagens desta tabela são removidas primeiro.

---

### TAB_MIDIA

**O que armazena:** Imagens e vídeos do site em si (não dos veículos) — carrosséis, banners, galeria da página "Sobre".

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | integer (PK) | Identificador |
| `titulo` | text | Título/legenda da mídia |
| `tipo` | text | `'imagem'` ou `'video'` |
| `url` | text | URL no Cloudinary |
| `secao` | text | Onde a mídia aparece (ver seções abaixo) |
| `ordem` | integer | Ordem de exibição na seção |

**Seções disponíveis:**

| Valor de `secao` | Onde aparece no site |
|---|---|
| `carrossel` | Background do hero da home page (imagem ou vídeo) |
| `sobre` | Galeria de fotos na seção "Sobre" da home |
| `banner-estoque` | Banner da página de estoque |
| `banner-contato` | Banner da página de contato |

**Como é populada:** Pelo admin via `/admin/midia`.

---

### TAB_CONFIGURACAO

**O que armazena:** Configurações de personalização do site — cores, textos, configurações de financiamento.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | integer (PK) | Identificador |
| `chave` | text | Nome da configuração (ex: `cor_primaria`) |
| `valor` | text | Valor atual (ex: `#ff6b00`) |
| `descricao` | text | Descrição legível do que essa config faz |
| `tipo` | text | Tipo do campo (`cor`, `texto`, `json`, etc.) |
| `categoria` | text | Agrupamento (`cores`, `financiamento`, etc.) |

**Como é populada:** Pelo admin via `/admin/personalizacao`. Os valores são carregados em todas as páginas pelo componente `TemaProvider` e aplicados como variáveis CSS.

---

### TAB_USUARIO

**O que armazena:** Usuários do painel administrativo.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | integer (PK) | Identificador |
| `nome` | text | Nome do usuário |
| `email` | text | E-mail de login |
| `senha` | text | Senha em texto puro (sem hash — ver Troubleshooting) |

**Como é populada:** Diretamente no banco via SQL. Não há interface de cadastro de usuários no painel.

> ⚠️ **Atenção:** As senhas são armazenadas sem criptografia. Isso é um ponto de melhoria de segurança planejado.

---

### TAB_AUDITORIA

**O que armazena:** Registro histórico de todas as criações, edições e exclusões feitas no sistema.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | integer (PK) | Identificador |
| `usuario` | text | Nome do admin que realizou a ação (do cookie `admin_usuario`) |
| `acao` | text | `CREATE`, `UPDATE` ou `DELETE` |
| `tabela` | text | Qual tabela foi afetada |
| `registro_id` | integer | ID do registro afetado |
| `dados_antes` | jsonb | Estado do registro antes da alteração |
| `dados_depois` | jsonb | Estado do registro após a alteração |
| `data_hora` | timestamp | Quando a ação ocorreu |

**Como é populada:** Automaticamente pelo sistema sempre que um dado é criado, alterado ou excluído via API.

---

### TAB_LEAD

**O que armazena:** Cada contato/cliente que demonstrou interesse — seja via formulário, botão WhatsApp ou cadastro manual.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | integer (PK) | Identificador |
| `nome` | text | Nome do cliente |
| `email` | text | E-mail do cliente |
| `telefone` | text | Telefone (pode ser "Desconhecido" se veio de clique WhatsApp) |
| `mensagem` | text | Mensagem original ou descrição da origem |
| `origem` | text | `contato`, `financiamento`, `interesse` ou `manual` |
| `etapa_id` | integer (FK) | Etapa atual no funil (referência a `TAB_LEAD_ETAPA`) |
| `carro_id` | integer (FK) | Veículo de interesse (opcional) |
| `valor_estimado` | numeric | Valor estimado do negócio (preenchido pelo admin) |
| `responsavel_id` | integer | Admin responsável pelo lead (opcional) |
| `criado_em` | timestamp | Data de entrada do lead |
| `atualizado_em` | timestamp | Última atualização |

**Como é populada:** Automaticamente pelos formulários do site e pelo clique no botão WhatsApp. Também pode ser criado manualmente no painel CRM.

---

### TAB_LEAD_ETAPA

**O que armazena:** As etapas do funil de vendas.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | integer (PK) | Identificador |
| `nome` | text | Nome da etapa (ex: "Novo", "Ganho") |
| `ordem` | integer | Posição no funil (menor = primeira) |
| `cor` | text | Cor hexadecimal para exibição visual |

**Etapas padrão do sistema:**

| Etapa | Significado |
|---|---|
| Novo | Lead recém-chegado, ainda não foi contactado |
| Contactado | O vendedor já entrou em contato |
| Negociação | Está em processo de negociação ativa |
| Ganho | Venda concluída (marca o veículo como indisponível) |
| Perdido | Negociação encerrada sem venda |

**Como é populada:** Por SQL direto. A tela de Configurações do CRM exibe as etapas mas ainda não permite editá-las pela interface.

---

### TAB_LEAD_INTERACAO

**O que armazena:** O histórico de todas as interações com um lead — ligações, mensagens, visitas, observações.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | integer (PK) | Identificador |
| `lead_id` | integer (FK) | Lead ao qual pertence |
| `tipo` | text | `ligacao`, `whatsapp`, `email`, `visita`, `observacao` |
| `texto` | text | Descrição da interação |
| `usuario` | text | Admin que registrou (ou `'Sistema'` para automáticas) |
| `criado_em` | timestamp | Data e hora da interação |

**Como é populada:** Manualmente pelo admin na tela de detalhe do lead. O sistema também cria interações automáticas quando um lead é movido para "Perdido" (aviso de verificar estoque manualmente).

---

### TAB_LEAD_TAREFA

**O que armazena:** Tarefas pendentes associadas a leads — follow-ups, ligações agendadas, visitas.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | integer (PK) | Identificador |
| `lead_id` | integer (FK) | Lead ao qual pertence |
| `tipo` | text | Tipo da tarefa: `Ligação`, `Visita`, `Follow-up`, `Proposta` |
| `descricao` | text | Descrição da tarefa |
| `prazo` | date | Data limite |
| `status` | text | `pendente` ou `concluida` |

**Como é populada:** Pelo admin na tela de detalhe do lead.

---

## 3. Site Público — Páginas e Funcionalidades

### Home (`/`)

**O que o visitante vê:** Uma página de entrada com fundo em vídeo ou imagem (carrossel), um bloco de texto de boas-vindas com botões de ação, uma seção de veículos em destaque e uma seção "Sobre" com galeria de fotos.

**De onde vêm os dados:**
- Fundo do hero: primeira mídia da seção `carrossel` em `TAB_MIDIA`. Se for vídeo, reproduz em loop automático. Se for imagem, exibe como background.
- Galeria "Sobre": mídias da seção `sobre` em `TAB_MIDIA`.
- Veículos em destaque: todos os carros com `disponivel = true` em `TAB_CARRO`.

**Ações disponíveis:** Botões que levam para `/estoque` e `/contato`. Clique nos cards de veículos abre a página de detalhe.

---

### Estoque (`/estoque`)

**O que o visitante vê:** Uma grade de cards com todos os veículos disponíveis, com filtro por marca.

**De onde vêm os dados:** `TAB_CARRO` onde `disponivel = true`. O filtro de marca é passado via query string (`?marca=Honda`) e aplicado com `ILIKE` no banco.

**Ações disponíveis:** Filtros de marca, modelo, preço e ano (processados no cliente pelo componente `VehicleInventory`). Clicar em um card leva para `/carro/[id]`.

---

### Detalhe do Carro (`/carro/[id]`)

**O que o visitante vê:** Página em layout dividido — galeria de imagens/vídeos à esquerda, informações e ações à direita.

**Informações exibidas:** Marca, modelo, preço, ano, quilometragem, combustível, cor e descrição do vendedor.

**De onde vêm os dados:**
- Dados do carro: `TAB_CARRO WHERE id = $1`
- Galeria: `TAB_CARRO_IMAGEM WHERE carro_id = $1 ORDER BY ordem`
- Se a URL da imagem contiver `mp4`, é exibida como vídeo; caso contrário, como imagem.

**Ações disponíveis:**

| Botão | O que faz |
|---|---|
| NEGOCIAR VIA WHATSAPP | Registra lead na TAB_LEAD (origem=`interesse`), envia notificação WhatsApp ao dono, abre `wa.me` com mensagem pré-preenchida |
| 📩 (envelope) | Navega para `/contato?carro_id=[id]`, pré-vinculando o formulário ao veículo |

---

### Empresa (`/empresa`)

**O que o visitante vê:** Informações sobre a concessionária, galeria de fotos e dados de contato.

**De onde vêm os dados:** Textos fixos na página. Imagens da seção `sobre` em `TAB_MIDIA`.

---

### Serviços (`/servicos`)

**O que o visitante vê:** Cards descritivos dos serviços oferecidos (financiamento, troca, avaliação, etc.). Conteúdo fixo na página.

---

### Financiamento (`/financiamento`)

**O que o visitante vê:** Hero com título e subtítulo configuráveis, grid de diferenciais, formulário de solicitação, lista de vantagens e seção "Como Funciona".

**De onde vêm os dados:** Títulos, diferenciais, vantagens e passos são carregados de `TAB_CONFIGURACAO` com chaves iniciando por `financiamento_` (armazenados como JSON). Se não houver configuração, usa valores padrão.

**O que acontece ao enviar o formulário:**
1. Campos validados no cliente (nome, email, telefone, mensagem obrigatórios)
2. POST para `/api/financiamento-contato` com nome, email, telefone, valorVeiculo, mensagem e (se houver) carro_id
3. E-mail enviado ao destinatário configurado em `CONTACT_RECIPIENT_EMAIL`
4. Lead criado em `TAB_LEAD` com `origem = 'financiamento'`
5. Notificação WhatsApp enviada ao dono
6. Formulário exibe toast de sucesso ao usuário

---

### Contato (`/contato`)

**O que o visitante vê:** Banner com imagem de fundo, bloco de informações de contato (endereço, telefone, e-mail, horário) e formulário.

**De onde vêm os dados:** Banner da seção `banner-contato` em `TAB_MIDIA`. Restante é fixo na página.

**O que acontece ao enviar o formulário:**
1. Campos validados (nome, email, telefone, assunto, mensagem obrigatórios)
2. Se o visitante chegou via botão 📩 de um carro, o `carro_id` é lido da URL e incluído no envio
3. POST para `/api/contact`
4. E-mail HTML enviado ao destinatário (template profissional com dados do cliente)
5. Lead criado em `TAB_LEAD` com `origem = 'contato'` e `carro_id` preenchido se houver
6. Notificação WhatsApp enviada ao dono
7. Formulário exibe mensagem de sucesso

**Exemplo prático:** João Silva preenche o formulário de contato vindo do botão 📩 do Honda Civic. O sistema cria um lead `{ nome: "João Silva", origem: "contato", carro_id: 42 }`, envia o e-mail ao dono e dispara uma mensagem WhatsApp informando que João tem interesse no Honda Civic.

---

## 4. Painel Administrativo — Guia de Uso

### Acesso

Acessar `/entrar`. Preencher e-mail e senha cadastrados em `TAB_USUARIO`. Ao fazer login com sucesso, o sistema salva `admin_logado=true` e `admin_nome` no `sessionStorage` do navegador, e seta o cookie `admin_usuario` para rastreamento nas auditorias.

> ⚠️ Se fechar o navegador ou a aba, o `sessionStorage` é limpo e você precisará fazer login novamente. Não use o modo anônimo para acessar o admin.

A sidebar lateral exibe todas as seções do painel. O botão "Sair" limpa a sessão e redireciona para `/entrar`.

---

### Dashboard (`/admin/dashboard`)

Exibe três métricas em tempo real, buscadas do banco a cada acesso:

| Métrica | O que mostra | Subtexto dinâmico |
|---|---|---|
| Veículos Cadastrados | Carros com `disponivel = true` | Quantidade com `disponivel = false` no mês atual |
| Leads no CRM | Total de leads em `TAB_LEAD` | Leads criados nos últimos 7 dias |
| Tarefas Vencidas | Tarefas com `status = 'pendente'` e `prazo < hoje` | "Requerem atenção" |

Abaixo, links de acesso rápido para todas as seções do painel.

---

### Carros (`/admin/carros`)

**O que é possível fazer:**
- Ver todos os veículos cadastrados (disponíveis e indisponíveis)
- Filtrar por marca, ano, cor, status (disponível/indisponível) ou busca por texto/placa
- Clicar em um carro para editá-lo
- Deletar um carro (com confirmação — remove também as imagens de `TAB_CARRO_IMAGEM`)
- Acessar a tela de novo carro

**Em segundo plano:** Cada deleção registra auditoria com os dados do carro antes da exclusão.

---

### Novo Carro (`/admin/carros/novo`)

**Passo a passo:**

1. Preencher os campos: Marca, Modelo, Ano, Cor, Placa (opcional), Preço, Descrição
2. Fazer upload da imagem principal (arquivo de imagem → Cloudinary → URL salva no campo `imagem_url`)
3. Marcar ou desmarcar "Disponível" (padrão: marcado)
4. Clicar em Salvar

**O que acontece em segundo plano:**
- POST para `/api/carros` com os dados do formulário
- Registro salvo em `TAB_CARRO`
- Auditoria `CREATE` registrada em `TAB_AUDITORIA`
- Redireciona para `/admin/carros?sucesso=Carro criado!`

> **Nota:** A página de novo carro permite apenas uma imagem principal. Imagens adicionais (galeria) são gerenciadas na tela de edição.

---

### Editar Carro (`/admin/carros/editar/[id]`)

**O que é possível fazer:**
- Alterar qualquer dado do carro
- Adicionar mais imagens à galeria (upload múltiplo)
- Reordenar imagens por ordem de exibição
- Remover imagens individuais da galeria
- Marcar o carro como indisponível manualmente (equivalente a "vendido")

**Em segundo plano:** Cada salvamento registra auditoria `UPDATE` com antes e depois dos dados.

---

### Mídia (`/admin/midia`)

**O que é possível fazer:** Fazer upload e gerenciar imagens/vídeos que aparecem no site (não nos veículos).

**Passo a passo:**

1. Selecionar a seção onde a mídia vai aparecer (carrossel, sobre, banner-estoque, banner-contato)
2. Opcionalmente preencher um título (obrigatório para seção "carrossel")
3. Selecionar o arquivo (imagem JPG/PNG/WebP ou vídeo MP4)
4. Clicar em Upload
5. A mídia aparece na lista abaixo, com opção de excluir

**Em segundo plano:**
- Arquivo enviado para Cloudinary via `/api/midia/upload`
- URL resultante salva em `TAB_MIDIA` com a seção escolhida
- Exclusão remove o registro de `TAB_MIDIA` (o arquivo no Cloudinary permanece)

---

### Personalização (`/admin/personalizacao`)

**O que é possível fazer:** Alterar cores e outros parâmetros visuais do site sem precisar de código.

**Como usar:**
1. As configurações são exibidas agrupadas por categoria
2. Para cores, um input de cor (`color picker`) permite selecionar visualmente
3. Clicar "Salvar" ao lado de cada item salva individualmente
4. O botão "Restaurar Padrões" redefine todas as configurações para os valores originais

**Em segundo plano:** Cada salvamento faz POST para `/api/configuracao` com a chave e o novo valor. `TemaProvider` (que roda em todas as páginas) lê essas configurações e injeta CSS dinamicamente.

> **Cuidado:** As alterações ficam visíveis para todos os visitantes imediatamente após salvar.

---

### Financiamento (`/admin/financiamento`)

Permite alterar o conteúdo da página de financiamento — título, subtítulo, diferenciais, vantagens e passos do processo. Os valores são salvos em `TAB_CONFIGURACAO` como JSON com chaves `financiamento_*`.

---

### Auditoria (`/admin/auditoria`)

**O que é possível fazer:** Visualizar o histórico completo de todas as ações realizadas no sistema.

**Filtros disponíveis:** Usuário, tabela afetada, tipo de ação (CREATE/UPDATE/DELETE), data inicial e data final.

**Como ler um registro:**
- Clicar em um log expande o **diff**: mostra campo a campo o que mudou, com o valor "antes" em vermelho e o "depois" em verde.
- Logs de CREATE não têm "antes". Logs de DELETE não têm "depois".

**Para que serve:** Rastrear quem alterou o quê e quando. Útil para investigar erros ou mudanças não autorizadas.

---

## 5. CRM — Gestão de Leads

### O que é o CRM

O CRM (Customer Relationship Management) é um sistema para organizar e acompanhar todos os contatos de clientes interessados em veículos. Cada contato é chamado de **lead**. O sistema ajuda a não deixar nenhum cliente sem resposta e a acompanhar cada negociação até o fechamento.

---

### Como um lead é criado automaticamente

Três ações no site geram leads automaticamente, sem nenhuma intervenção do admin:

| Origem | O que acontece | `origem` no banco |
|---|---|---|
| Formulário de contato | Cliente preenche `/contato` | `'contato'` |
| Formulário de financiamento | Cliente preenche `/financiamento` | `'financiamento'` |
| Botão "NEGOCIAR VIA WHATSAPP" | Cliente clica no botão na página do carro | `'interesse'` |

Em todos os casos, o lead entra automaticamente na primeira etapa do funil ("Novo") e o dono recebe uma notificação WhatsApp.

Se o cliente veio da página de um carro (via botão 📩 ou diretamente), o campo `carro_id` do lead é preenchido, vinculando o lead ao veículo de interesse.

---

### Etapas do funil

| Etapa | Cor | O que significa |
|---|---|---|
| **Novo** | Azul | Lead recém chegado, ainda não foi contatado |
| **Contactado** | Amarelo | Você já entrou em contato com o cliente |
| **Negociação** | Roxo | Estão discutindo condições, preço, financiamento |
| **Ganho** | Verde | Venda fechada — o sistema marca o carro como vendido automaticamente |
| **Perdido** | Vermelho | Negociação encerrada sem compra |

---

### Tela de Leads (`/admin/crm/leads`)

**O que você vê:** Uma lista de todos os leads com nome, e-mail, etapa atual, origem e data de entrada.

**Filtros disponíveis:**
- Busca por nome ou e-mail (filtragem no cliente)
- Filtro por etapa do funil
- Filtro por origem (contato, financiamento, interesse, manual)

**Criar lead manual:**
Clicar no botão "+ Novo Lead" abre um modal com campos: nome, e-mail, telefone, origem, mensagem e etapa inicial. Útil para registrar contatos recebidos por telefone ou pessoalmente.

**Abrir detalhe:** Clicar em qualquer linha da lista abre a página de detalhe do lead.

---

### Funil Kanban (`/admin/crm/funil`)

**O que você vê:** Colunas organizadas por etapa, com cards de leads. Cada card mostra nome, origem, data de entrada e valor estimado.

Todos os leads são carregados e agrupados por etapa. Esta visualização facilita ver quantos negócios estão em cada fase.

---

### Detalhe do Lead (`/admin/crm/leads/[id]`)

A tela mais completa do CRM. Dividida em seções:

**Dados do Lead:**
- Nome, e-mail, telefone, data de entrada, mensagem original

**Veículo de Interesse:**
- Modelo do carro vinculado (se houver)
- Status de disponibilidade (Disponível / Indisponível / Vendido)
- Links diretos para ver a página do carro e para editar no admin

**Negociação:**
- **Etapa:** Select para mover o lead entre as etapas do funil. Ao mudar, a atualização é imediata.
- **Valor Estimado:** Campo numérico para registrar o valor esperado do negócio. Clique em "Salvar" para confirmar.
- **Tarefas:** Lista de tarefas do lead, com checkbox para marcar como concluída. Botão "+ Nova Tarefa" abre formulário com tipo, data limite e descrição.

**Histórico de Interações (Timeline):**
- Exibe todas as interações em ordem cronológica inversa (mais recente primeiro)
- Para registrar uma nova interação: selecione o tipo (📞 Ligação, 💬 WhatsApp, 📧 Email, 🏢 Visita, 📝 Observação), escreva o texto e clique em "Registrar"
- Interações automáticas do Sistema também aparecem aqui (ex: aviso de lead marcado como Perdido)

---

### Integração automática Ganho → Estoque

Quando um lead é movido para a etapa **"Ganho"**:

1. Se o lead tiver um `carro_id` vinculado, o sistema executa automaticamente:
   ```sql
   UPDATE TAB_CARRO SET disponivel = false WHERE id = carro_id
   ```
2. Registra auditoria desta alteração em `TAB_AUDITORIA`
3. O carro desaparece do estoque público imediatamente
4. Na tela do admin, aparece um segundo toast: *"Veículo marcado como vendido no estoque automaticamente"*

Quando movido para **"Perdido":**
- O carro **não** é reativado automaticamente (pode ter sido vendido por outro motivo)
- Uma interação automática é registrada no histórico: *"Lead marcado como Perdido. Verifique manualmente a disponibilidade do veículo."*

---

### Tarefas (`/admin/crm/tarefas`)

Exibe uma visão consolidada de todas as tarefas de todos os leads.

**O que você vê:** Lista de tarefas com descrição, tipo, nome do lead vinculado, prazo e status. Tarefas vencidas aparecem destacadas em vermelho.

**Criar tarefa:** Selecionar o lead, tipo, data limite e descrição. A tarefa é criada e fica visível tanto aqui quanto no detalhe do lead.

**Marcar como concluída:** Checkbox ao lado de cada tarefa. A ação é reversível.

---

### Relatórios (`/admin/crm/relatorios`)

Métricas calculadas diretamente no banco a cada acesso:

| Métrica | O que mostra |
|---|---|
| Leads nos últimos 30 dias | Volume de entradas recentes |
| Ganhos nos últimos 30 dias | Vendas concluídas no período |
| Perdidos nos últimos 30 dias | Negociações encerradas sem venda |
| Tempo médio até Ganho | Média de dias desde a entrada até o fechamento |
| Leads por mês (últimos 6 meses) | Gráfico de barras com volume mensal |
| Leads por etapa | Distribuição atual do funil |
| Últimas 10 vendas | Nome do cliente, veículo, valor e data do fechamento |

---

### Configurações do CRM (`/admin/crm/configuracoes`)

Tela informativa que exibe:
- **Etapas do funil** em ordem, com cor e ID de cada uma
- **Tipos de interação** disponíveis (Ligação, WhatsApp, E-mail, Visita, Observação)
- **Origens de captura automática** configuradas no sistema

> Esta tela é somente leitura. Para alterar as etapas, é necessário editar diretamente no banco de dados.

---

### Alerta "Leads Esfriando"

No dashboard do CRM, uma seção especial aparece automaticamente quando existem leads que:
- Estão em etapas ativas (não Ganho e não Perdido)
- Não tiveram nenhuma interação nos últimos 3 dias, **ou** nunca tiveram nenhuma interação

Os leads são listados do mais antigo para o mais recente, com o tempo desde a última interação. Clicar no lead abre a tela de detalhe diretamente. Máximo de 5 leads exibidos.

---

## 6. Notificações WhatsApp

### Como funciona

O sistema usa a **Evolution API** — a mesma que você já usa para automações com n8n. Quando um lead é capturado, o servidor faz uma chamada HTTP para a Evolution API, que entrega a mensagem via WhatsApp Business.

### Quando uma notificação é disparada

| Gatilho | Mensagem enviada |
|---|---|
| Formulário de contato preenchido | Dados do cliente, origem: "Formulário de Contato" |
| Formulário de financiamento preenchido | Dados do cliente, origem: "Simulador de Financiamento" |
| Clique em "NEGOCIAR VIA WHATSAPP" em um carro | Dados do cliente, veículo de interesse, origem: "Botão Tenho Interesse" |

### Conteúdo da mensagem

```
🚗 *NOVO LEAD IDENTIFICADO*

*Cliente:* [Nome do Cliente]
*Telefone:* [Telefone]
*Email:* [Email] (se disponível)
*Veículo:* [Marca Modelo Ano] (se disponível)
*Origem:* [Origem do lead]

📱 *Acessar CRM:* https://seu-site.com/admin/crm/leads

Acesse rápido pelo celular para não perder o lead!
```

### Configuração necessária

Quatro variáveis de ambiente devem estar configuradas (ver seção 10):
- `EVOLUTION_API_URL` — URL base da sua Evolution API
- `EVOLUTION_API_KEY` — Chave de autenticação
- `EVOLUTION_INSTANCE` — Nome da instância WhatsApp conectada
- `WHATSAPP_NUMERO_DONO` — Número que receberá as notificações (formato: 5518999999999)

### O que acontece se a notificação falhar

**Nada de visível para o usuário.** O código captura o erro silenciosamente e continua o fluxo. O lead é criado normalmente no banco, o e-mail é enviado e o formulário exibe sucesso. Apenas o log do servidor registra o erro (`[WhatsApp Evolution] Erro ao enviar notificação`).

---

## 7. Upload de Imagens e Vídeos

### Como o Cloudinary é usado

O Cloudinary é um serviço de armazenamento e entrega de mídia em nuvem. Toda imagem ou vídeo enviado pelo admin vai para o Cloudinary, que retorna uma URL pública. Essa URL é salva no banco de dados e usada para exibir o conteúdo no site.

### Fluxo de upload de foto de carro

1. Admin seleciona o arquivo na tela de novo/editar carro
2. O arquivo é enviado via multipart para `/api/upload`
3. O servidor configura o Cloudinary com as credenciais de ambiente
4. O arquivo é transferido para o Cloudinary usando `cloudinary.uploader.upload_stream`
5. O Cloudinary retorna a URL pública do arquivo
6. A URL é salva em `TAB_CARRO_IMAGEM` com o `carro_id` e a `ordem` correspondente

### Fluxo de upload de mídia do site

1. Admin seleciona seção e arquivo na tela de Mídia
2. Arquivo enviado para `/api/midia/upload` → Cloudinary
3. URL retornada é passada para POST `/api/midia` com o título e a seção
4. Registro salvo em `TAB_MIDIA`

### Seções de mídia e onde aparecem

| Seção | Onde aparece |
|---|---|
| `carrossel` | Fundo do hero da home (vídeo em loop ou imagem) |
| `sobre` | Galeria na seção "Sobre" da home |
| `banner-estoque` | Banner topo da página de estoque |
| `banner-contato` | Banner topo da página de contato |

### Formatos aceitos

| Tipo | Formatos |
|---|---|
| Imagem | JPG, JPEG, PNG, WebP, GIF |
| Vídeo | MP4 (e outros formatos de vídeo) |

O sistema detecta automaticamente se é imagem ou vídeo pelo `Content-Type` do arquivo.

---

## 8. Auditoria

### O que é registrado

Toda mutação de dados via API registra automaticamente um log em `TAB_AUDITORIA`. Isso inclui:
- Criação de carros, imagens, mídias, leads, interações, tarefas
- Edição de carros, leads, configurações
- Exclusão de carros, imagens, mídias
- Marcação automática de carro como indisponível ao fechar venda no CRM

A função responsável é `registrarAuditoria()` de `src/lib/auditoria.ts`. O nome do admin é capturado do cookie `admin_usuario` pela função `getClientInfo()`.

### Como ler o log

Acesse `/admin/auditoria`. Cada linha da tabela mostra:
- **Usuário** que realizou a ação
- **Ação** (CREATE / UPDATE / DELETE)
- **Tabela** afetada
- **ID** do registro
- **Data/hora**

Ao clicar em um registro, o sistema compara os objetos `dados_antes` e `dados_depois` campo a campo e exibe apenas os campos que mudaram.

**Exemplo:** Um carro com preço R$ 45.000 é editado para R$ 48.000. O log exibirá apenas o campo `preco` com "antes: 45000" e "depois: 48000".

### Para que serve

- Identificar quem excluiu um carro acidentalmente
- Verificar quando um preço foi alterado e por quem
- Ter histórico completo de todas as vendas marcadas como "Ganho"
- Investigar inconsistências nos dados

---

## 9. Personalização do Site

### Como alterar cores

1. Acesse `/admin/personalizacao`
2. Localize a cor que deseja alterar (use a descrição ao lado de cada campo)
3. Clique no quadrado colorido para abrir o seletor de cores, ou digite o código hex diretamente
4. Clique em "Salvar" ao lado do campo
5. A cor muda no site imediatamente para todos os visitantes

### Como funciona o TemaProvider

O componente `TemaProvider` (`src/components/TemaProvider.tsx`) é carregado em todas as páginas via o layout raiz. Ele:

1. Faz GET para `/api/configuracao` ao montar
2. Recebe a lista de configurações com chave/valor
3. Gera uma tag `<style>` com variáveis CSS e overrides de classes
4. Injeta essa tag no `<head>` do documento

O resultado é que alterações salvas no banco aparecem no site sem necessidade de redeploy.

### Elementos que mudam com cada cor

As chaves de configuração definem quais elementos são afetados. Consulte `TAB_CONFIGURACAO` para ver as chaves disponíveis e suas descrições. As mais importantes geralmente são `cor_primaria` (botões e destaques), `cor_header` (fundo do cabeçalho) e `cor_footer` (fundo do rodapé).

---

## 10. Variáveis de Ambiente

Todas as variáveis ficam no arquivo `.env.local` na raiz do projeto (nunca versionado no git). Para produção, são configuradas no painel da Vercel.

| Variável | O que configura | Onde obter | Obrigatória? |
|---|---|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL | Painel do banco (ex: Supabase, Railway, Neon) | ✅ Sim |
| `CLOUDINARY_CLOUD_NAME` | Nome do cloud no Cloudinary | Dashboard Cloudinary → Settings → Account | ✅ Sim |
| `CLOUDINARY_API_KEY` | Chave de API do Cloudinary | Dashboard Cloudinary → Settings → API Keys | ✅ Sim |
| `CLOUDINARY_API_SECRET` | Secret de API do Cloudinary | Dashboard Cloudinary → Settings → API Keys | ✅ Sim |
| `EMAIL_USER` | Endereço Gmail que envia os e-mails | Sua conta Gmail | ✅ Sim |
| `EMAIL_PASS` | Senha de app do Gmail (não é a senha normal) | Conta Google → Segurança → Senhas de app | ✅ Sim |
| `CONTACT_RECIPIENT_EMAIL` | E-mail que recebe os formulários de contato | Qualquer e-mail seu | ✅ Sim |
| `EVOLUTION_API_URL` | URL base da Evolution API | Painel da Evolution API / provedor | ✅ Para WhatsApp |
| `EVOLUTION_API_KEY` | Chave de autenticação da Evolution API | Painel da Evolution API | ✅ Para WhatsApp |
| `EVOLUTION_INSTANCE` | Nome da instância WhatsApp conectada | Painel da Evolution API | ✅ Para WhatsApp |
| `WHATSAPP_NUMERO_DONO` | Número que recebe as notificações de leads | Seu número (formato: 5518999999999) | ✅ Para WhatsApp |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (usada nos links das mensagens WhatsApp) | URL da Vercel ou domínio | ⚠️ Recomendada |

**Como criar senha de app do Gmail:**
1. Acesse myaccount.google.com
2. Segurança → Verificação em duas etapas (deve estar ativa)
3. Segurança → Senhas de app
4. Criar senha para "Outro (nome personalizado)" → copie a senha gerada

---

## 11. Fluxos Completos

### Fluxo: Visitante vê um carro e clica em WhatsApp

1. Visitante acessa `/carro/42`
2. Clica em "NEGOCIAR VIA WHATSAPP"
3. **No cliente:** O navegador faz POST para `/api/carros/42/interesse` com `{ marca, modelo, ano }`
4. **No servidor:**
   - INSERT em `TAB_LEAD`: `{ nome: "Visitante WhatsApp", telefone: "Desconhecido", origem: "interesse", carro_id: 42, etapa_id: 1 }`
   - `registrarAuditoria()` registra o lead criado
   - `enviarWhatsAppLead()` envia notificação ao dono com dados do veículo
5. **No cliente:** Independente do resultado, abre `wa.me/5518996692266?text=Tenho interesse no Honda Civic`
6. **No dono:** Recebe mensagem WhatsApp e pode acessar o CRM para ver o lead

---

### Fluxo: Visitante preenche formulário de contato

1. Visitante acessa `/contato` (ou `/contato?carro_id=42` se veio da página de um carro)
2. Preenche: Nome, E-mail, Telefone, Assunto, Mensagem
3. Clica em "Enviar Mensagem"
4. **No cliente:** Validação dos campos. Se válido, POST para `/api/contact`
5. **No servidor (em paralelo/sequencial):**
   - Tenta enviar e-mail HTML para `CONTACT_RECIPIENT_EMAIL` (falha silenciosamente se e-mail não estiver configurado)
   - `criarLeadAutomatico()` → INSERT em `TAB_LEAD` com todos os dados e `carro_id` se informado
   - `enviarWhatsAppLead()` → notificação ao dono
6. **No cliente:** Exibe mensagem de sucesso, limpa o formulário

---

### Fluxo: Admin cadastra um carro novo com fotos

1. Admin acessa `/admin/carros/novo`
2. Preenche os dados do formulário
3. Seleciona a imagem principal → upload automático para Cloudinary → URL preenchida no campo
4. Clica em Salvar
5. **No servidor:** POST `/api/carros` → INSERT em `TAB_CARRO` → `registrarAuditoria(CREATE)`
6. Admin é redirecionado para `/admin/carros` com mensagem de sucesso
7. Para adicionar mais fotos: acessar `/admin/carros/editar/[id]` e usar o upload múltiplo de imagens

---

### Fluxo: Admin move lead para "Ganho"

1. Admin acessa `/admin/crm/leads/[id]`
2. No select de etapa, seleciona "Ganho"
3. **No servidor (PUT `/api/leads/[id]`):**
   - `UPDATE TAB_LEAD SET etapa_id = X WHERE id = lead_id`
   - Busca o nome da nova etapa em `TAB_LEAD_ETAPA`
   - Como é "Ganho" e o lead tem `carro_id`:
     - Salva `dadosAntes` do carro
     - `UPDATE TAB_CARRO SET disponivel = false WHERE id = carro_id`
     - `registrarAuditoria(UPDATE, TAB_CARRO)` com antes e depois
   - Retorna `{ ...lead, carro_marcado_vendido: true }`
4. **No cliente:**
   - Toast: "Etapa atualizada!"
   - 3,2 segundos depois: Toast: "Veículo marcado como vendido no estoque automaticamente"
5. O carro desaparece do estoque público na próxima visita

---

### Fluxo: Admin altera cor do site

1. Admin acessa `/admin/personalizacao`
2. Localiza a configuração (ex: "Cor Primária")
3. Usa o color picker para selecionar a nova cor
4. Clica em "Salvar" ao lado do campo
5. **No servidor:** POST `/api/configuracao` com `{ chave: "cor_primaria", valor: "#e63946" }`
6. `TAB_CONFIGURACAO` atualizada
7. Na próxima visita de qualquer página, `TemaProvider` lê a nova cor e aplica via CSS

---

## 12. Troubleshooting

### E-mail não está sendo enviado

**Sintoma:** Formulário retorna sucesso mas o e-mail não chega.

**Causas prováveis e soluções:**

1. **`EMAIL_USER` ou `EMAIL_PASS` não configurados** → Verifique as variáveis de ambiente na Vercel. O sistema envia um aviso no log: `[CONTACT API] Transporter não configurado — email não enviado`.

2. **Senha de app incorreta** → A `EMAIL_PASS` deve ser a senha de app gerada no Google (16 caracteres sem espaços), não a senha normal da conta Google.

3. **Verificação em duas etapas desativada** → Senhas de app só funcionam com 2FA ativo na conta Google.

4. **E-mail caiu no spam** → Verifique a pasta de spam do destinatário configurado em `CONTACT_RECIPIENT_EMAIL`.

5. **Domínio bloqueado** → Em produção (Vercel), algumas regiões têm restrições SMTP. Teste enviando um e-mail de teste manualmente via Node.

---

### Notificação WhatsApp não chega

**Sintoma:** Lead criado no banco mas o dono não recebe mensagem.

**Causas prováveis e soluções:**

1. **Variáveis de ambiente não configuradas** → Verifique `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`, `WHATSAPP_NUMERO_DONO` na Vercel. O log mostrará: `[WhatsApp Evolution] Credenciais não configuradas`.

2. **Instância desconectada** → Acesse o painel da Evolution API e verifique se a instância está com status "Connected". WhatsApp pode ter desconectado após reinício ou inatividade.

3. **Número incorreto** → `WHATSAPP_NUMERO_DONO` deve estar no formato E.164 sem símbolos: `5518999999999` (55 = Brasil, DDD, número).

4. **URL da API errada** → A URL não deve ter barra no final. Formato correto: `https://chat.atautomacoes.com`.

5. **Verificar logs** → Em `/admin/auditoria` os leads aparecem (o lead foi criado). O erro está somente no WhatsApp. Verifique os logs da Vercel em Runtime Logs.

---

### Upload de imagem falha

**Sintoma:** Mensagem de erro ao tentar fazer upload de foto.

**Causas prováveis e soluções:**

1. **Credenciais Cloudinary incorretas** → Verifique `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET`. O log mostrará qual credencial está faltando.

2. **Arquivo muito grande** → A Vercel tem limite de 4.5 MB para uploads em funções serverless. Use imagens otimizadas.

3. **Formato não suportado** → Apenas imagens e vídeos são aceitos. PDFs, documentos e outros tipos são rejeitados com "Tipo de arquivo não suportado".

4. **Quota do Cloudinary** → Na conta gratuita do Cloudinary há limites de armazenamento e transferência. Verifique o dashboard do Cloudinary.

---

### Carro não aparece no estoque

**Sintoma:** Carro cadastrado mas não aparece em `/estoque` ou `/`.

**Causas prováveis e soluções:**

1. **`disponivel = false`** → A causa mais comum. Verifique na tela de edição do carro se o campo "Disponível" está marcado. Pode ter sido desmarcado manualmente ou automaticamente ao fechar uma venda.

2. **Carro vinculado a lead "Ganho"** → Se havia um lead com esse `carro_id` que foi movido para Ganho, o carro foi automaticamente marcado como indisponível. Consulte `/admin/auditoria` filtrando por `tabela = TAB_CARRO` para confirmar.

3. **Cache do banco** → As páginas usam `force-dynamic`, então não há cache do Next.js. Mas se o banco PostgreSQL estiver com replicação, pode haver atraso. Recarregue a página.

---

### Login não funciona

**Sintoma:** Mensagem "Email ou senha inválidos" mesmo com credenciais corretas.

**Causas prováveis e soluções:**

1. **Usuário não cadastrado no banco** → Verifique se existe um registro em `TAB_USUARIO` com o e-mail informado. Execute no banco: `SELECT * FROM TAB_USUARIO WHERE email = 'seu@email.com'`

2. **Senha diferente** → As senhas são armazenadas em texto puro. Confirme a senha exata cadastrada no banco.

3. **Cookie bloqueado** → O sistema usa um cookie (`admin_usuario`) e `sessionStorage`. Verifique se o navegador não está bloqueando cookies de terceiros. Não use modo anônimo.

4. **Banco de dados offline** → A API de login consulta o banco. Se o banco estiver inacessível, o login falhará com erro de conexão (não "senha inválida"). Verifique o status do banco na Vercel.

---

### Cores do site não mudam

**Sintoma:** Alteração salva com sucesso no painel mas o site não muda.

**Causas prováveis e soluções:**

1. **Cache do navegador** → O `TemaProvider` faz fetch com `cache: 'no-store'`, mas o navegador pode ter cacheado o CSS injetado. Force um hard reload: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac).

2. **Erro silencioso no TemaProvider** → Abra o console do navegador (F12) e verifique se há erros na aba Console. Pode haver falha no fetch de `/api/configuracao`.

3. **Chave de configuração incorreta** → Se a chave salva não corresponde ao que o `TemaProvider` espera, a cor não será aplicada. Verifique os nomes das chaves em `TAB_CONFIGURACAO`.

4. **JavaScript desabilitado** → O TemaProvider é client-side. Se o JavaScript estiver desabilitado no navegador, o tema não carrega. Verifique que o JS está ativo.

---

*Para dúvidas técnicas adicionais, consulte `CLAUDE.md` para referência de arquitetura e padrões de código.*
