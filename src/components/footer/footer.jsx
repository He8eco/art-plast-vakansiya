import "./footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="footer">
        <section className="contacts">
          <p>Наши контакты</p>
          <p>+7 (928) 603-55-58</p>
          <p>art-plast.semik@yandex.ru</p>
          <p>г. Семикаракорск, ул. Калинина 138А</p>
        </section>
        <section className="map">Яндекс.Карты (будут позже)</section>
      </div>
      <div className="footer__title">© Арт-Пласт 2024</div>
    </footer>
  );
}
