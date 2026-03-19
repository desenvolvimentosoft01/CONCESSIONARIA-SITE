import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerContainer">
        <div className="footerColuna">
          <h3 className="footerTitulo">LUCAS VEÍCULOS</h3>
          <p className="footerTexto">Há 10 anos realizando sonhos</p>
        </div>
        
        <div className="footerColuna">
          <h3 className="footerTitulo">Horário de atendimento</h3>
          <p className="footerTexto">Seg a Sex: 9h às 18h</p>
          <p className="footerTexto">Sábado: 9h às 12h</p>
        </div>
        
        <div className="footerColuna">
          <h3 className="footerTitulo">Contato</h3>
          <p className="footerTexto">(18) 99669-2266</p>
          <p className="footerTexto">contato@lucas.com</p>
        </div>
        
        <div className="footerColuna">
          <h3 className="footerTitulo">Endereço</h3>
          <p className="footerTexto">Av. Teste, 1000</p>
          <p className="footerTexto">Centro - Araçatuba/SP</p>
        </div>
      </div>
      
      <div className="footerBottom">
        <p className="copyright">© 2026 Desenvolvido por AzSistemas. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
