'use client';

import { useEffect, useState } from 'react';

export default function TemaProvider() {
  const [cores, setCores] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/configuracao')
      .then(res => res.json())
      .then(data => {
        const coresObj: Record<string, string> = {};
        data.forEach((config: any) => {
          if (config.tipo === 'color') {
            coresObj[config.chave] = config.valor;
          }
        });
        setCores(coresObj);
      })
      .catch(console.error);
  }, []);

  if (Object.keys(cores).length === 0) return null;

  const cssVars = `
    :root {
      --cor-primaria: ${cores.cor_primaria || '#c5a059'};
      --cor-secundaria: ${cores.cor_secundaria || '#333333'};
      --cor-header: ${cores.cor_header || '#1a1a1a'};
      --cor-footer: ${cores.cor_footer || '#1a1a1a'};
      --cor-botao-primario: ${cores.cor_botao_primario || '#c5a059'};
      --cor-botao-secundario: ${cores.cor_botao_secundario || '#333333'};
      --cor-whatsapp: ${cores.cor_whatsapp || '#25d366'};
      --cor-link: ${cores.cor_link || '#007bff'};
      --cor-sucesso: ${cores.cor_sucesso || '#28a745'};
      --cor-erro: ${cores.cor_erro || '#dc3545'};
    }

    /* Aplicar cores */
    .header { background-color: var(--cor-header) !important; }
    .footer, .footerContainer { background-color: var(--cor-footer) !important; }
    
    .botaoDetalhes, .sobreBotao, .ctaBotaoContato { 
      background-color: var(--cor-botao-primario) !important; 
    }
    
    .botaoWhatsApp, .whatsapp-flutuante, .ctaBotaoWhatsApp, .botaoWhatsapp { 
      background-color: var(--cor-whatsapp) !important; 
    }
    
    .cardPreco, .sobreTitulo, .destaqueTitulo, .footerTitulo,
    .empresa-numero-valor, .badge { 
      color: var(--cor-primaria) !important; 
    }
    
    a:hover { color: var(--cor-link) !important; }
    
    .mensagemSucesso { background-color: var(--cor-sucesso) !important; }
    .mensagemErro { background-color: var(--cor-erro) !important; }
  `;

  return <style dangerouslySetInnerHTML={{ __html: cssVars }} />;
}
