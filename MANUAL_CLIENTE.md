# Manual do Administrador — Lucas Veículos

## Acesso ao Painel

1. Acesse `/entrar` no seu site
2. Digite usuário e senha
3. Você será redirecionado para o **Painel Principal**

> A sessão fica ativa enquanto o navegador estiver aberto. Ao fechar, precisa entrar novamente.

---

## Painel Principal (`/admin/dashboard`)

Exibe um resumo rápido:
- **Veículos cadastrados** — total no estoque + quantos foram vendidos no mês
- **Leads no CRM** — total de contatos + novos na semana
- **Tarefas Vencidas** — follow-ups atrasados que precisam de atenção

Botões de acesso rápido para todas as seções.

---

## Veículos (`/admin/carros`)

### Adicionar veículo
1. Clique em **+ Novo Veículo**
2. Preencha: marca, modelo, ano, preço, km, câmbio, cor, combustível, descrição
3. Faça upload das fotos (pode adicionar várias; arraste para ordenar)
4. Salve — o carro aparece imediatamente no estoque público

### Editar veículo
- Clique no veículo na lista → edite os campos → Salvar

### Marcar como vendido
- Edite o veículo e desmarque **"Disponível"**
- O carro sai do estoque público, mas fica no histórico
- Isso também acontece **automaticamente** quando você move o lead para "Ganho" no CRM

### Excluir veículo
- Clique no ícone de lixeira na lista de veículos
- As fotos são removidas do servidor junto

---

## CRM — Gestão de Leads (`/admin/crm`)

O CRM organiza todos os contatos recebidos (formulários, WhatsApp, financiamento).

### Dashboard CRM
Visão geral com:
- Total de leads, taxa de conversão, ticket médio, tarefas vencidas
- **Funil de vendas** — quantos leads em cada etapa
- **Leads recentes** — últimos 5 contatos
- **Leads esfriando** — contatos sem interação há mais de 3 dias (atenção!)

### Lista de Leads (`/admin/crm/leads`)
- Filtre por etapa, origem ou pesquise por nome
- Clique em qualquer lead para abrir o detalhe

### Detalhe do Lead (`/admin/crm/leads/[id]`)
Tudo sobre um contato em uma tela só:

- **Etapa**: mova o lead pelo pipeline (Novo → Contactado → Negociação → Ganho / Perdido)
- **Veículo vinculado**: qual carro o lead se interessou
- **Valor estimado**: valor esperado da venda
- **Interações**: registre ligações, e-mails, reuniões, anotações
- **Tarefas**: crie follow-ups com prazo e tipo (ligação, e-mail, visita, etc.)

> Ao mover para **Ganho**: o veículo vinculado é marcado como vendido automaticamente.

### Funil Kanban (`/admin/crm/funil`)
Visão em colunas — arraste leads entre etapas.

### Tarefas (`/admin/crm/tarefas`)
Lista todas as tarefas pendentes de todos os leads, ordenadas por prazo.
Tarefas vencidas aparecem em vermelho.

### Relatórios (`/admin/crm/relatorios`)
- Leads por mês (gráfico de barras)
- Leads por etapa, por origem
- Valor em negociação
- Lista de leads ganhos com botão **Exportar CSV** (abre no Excel)

### Configurações do CRM (`/admin/crm/configuracoes`)
- Edite o nome e a cor de cada etapa do pipeline
- Adicione novas etapas
- Exclua etapas (só é possível se não houver leads nela)

---

## Mídia (`/admin/midia`)

Gerencie as imagens e vídeos que aparecem no site:
- Cada seção (banner, galeria, sobre, etc.) tem seus próprios arquivos
- Faça upload de novas imagens ou remova as existentes
- As alterações aparecem no site imediatamente

---

## Personalização (`/admin/personalizacao`)

Altere as cores do site (cor principal, cor do header, botões, etc.).
- Escolha a cor com o seletor
- Clique em **Salvar** — o site atualiza em tempo real para todos os visitantes

---

## Auditoria (`/admin/auditoria`)

Histórico completo de tudo que foi alterado no sistema:
- Quem fez a alteração, quando, e o que mudou
- Útil para rastrear modificações ou erros

---

## Página de Financiamento (`/admin/financiamento`)

Edite o conteúdo da página de financiamento pública (texto, condições, etc.).

---

## Origens dos Leads

Os leads chegam automaticamente de:

| Origem | Como chega |
|---|---|
| `formulario-contato` | Formulário em /contato |
| `formulario-financiamento` | Formulário em /financiamento |
| `whatsapp-interesse` | Botão "Negociar via WhatsApp" na página do carro |

Ao receber um lead, você recebe uma **notificação no WhatsApp** automaticamente.

---

## Dicas Rápidas

- **Lead esfriando?** Entre em contato e registre uma interação — ele sai do alerta.
- **Vendeu um carro?** Mova o lead para "Ganho" — o estoque atualiza sozinho.
- **Follow-up pendente?** Crie uma tarefa com prazo para não esquecer.
- **Exportar contatos?** Use o botão "Exportar CSV" em Relatórios.
