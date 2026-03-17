class PopUpPolicy extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Bind per add/remove listener in modo pulito
    this._onKeyDown = this._onKeyDown.bind(this);
    this._close = this._close.bind(this);

    this.shadowRoot.innerHTML = `
      <style>
        :host { all: initial; }

        .overlay{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.55);
          display: grid;
          place-items: center;
          z-index: 9999;
          padding: 16px;
        }

        .dialog{
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          background: #111;
          color: #eee;
          width: min(720px, 100%);
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 10px 40px rgba(0,0,0,.6);
          border: 1px solid rgba(255,255,255,.08);
        }

        .header{
          display:flex;
          justify-content: space-between;
          align-items: start;
          gap: 12px;
        }

        h2{
          margin: 0;
          font-size: 18px;
          line-height: 1.2;
        }

        p{ margin: 12px 0; line-height: 1.5; }

        ul{
          margin: 8px 0 0 18px;
          padding: 0;
          line-height: 1.5;
        }

        .actions{
          margin-top: 14px;
          display:flex;
          justify-content: flex-end;
          gap: 10px;
        }

        button{
          cursor: pointer;
          border: 1px solid rgba(255,255,255,.16);
          background: rgba(255,255,255,.06);
          color: #eee;
          padding: 10px 12px;
          border-radius: 10px;
          font-weight: 600;
        }
        button:hover{ background: rgba(255,255,255,.10); }
        button:focus{ outline: 2px solid rgba(120,170,255,.9); outline-offset: 2px; }

        /* Accessibilità: rispetta preferenza riduzione animazioni */
        @media (prefers-reduced-motion: no-preference) {
          .dialog { animation: pop .14s ease-out; }
          @keyframes pop {
            from { transform: translateY(6px); opacity: .96; }
            to   { transform: translateY(0);   opacity: 1; }
          }
        }
        
        @media (max-width: 480px) {
          .dialog{
            width: 100%;
            padding: 16px;
          }
        }

        @media (max-width: 320px) {
          .dialog{
            padding: 12px;
          }
          .header{
            flex-direction: column;
            align-items: start;
          }
          .actions{
            justify-content: center;
          }
        } 
        
      </style>

      <div class="overlay" part="overlay">
        <div class="dialog" part="dialog" role="dialog" aria-modal="true" aria-labelledby="pp-title" tabindex="-1">
          <div class="header">
            <h2 id="pp-title">Privacy &amp; Dati</h2>
            <button type="button" id="x-btn" aria-label="Chiudi finestra privacy">✕</button>
          </div>

          <p>
            Questo sito è una <strong>Port-folio personale</strong>.
            Non è un e-commerce e non offre servizi a pagamento.
          </p>

          <p>
            <strong>Nessun dato personale viene trattato da terzi</strong> per finalità di profilazione o marketing
            e non condivido informazioni con soggetti esterni.
          </p>

          <p>
            In particolare:
          </p>
          <ul>
            <li>non vengono richiesti moduli di registrazione o dati sensibili;</li>
            <li>non vengono venduti o ceduti dati a terze parti;</li>
            <li>eventuali contenuti/azioni sono finalizzati solo all’esperienza interattiva sul sito.</li>
          </ul>

          <p>
            Se in futuro verranno integrati strumenti esterni (es. analytics, mappe, video embed),
            questa informativa verrà aggiornata prima dell’attivazione.
          </p>
          <p>Per maggiori dettagli sulla privacy visita la pagina <a href="./pages/policy.html">Privacy Policy</a>.</p>
          <div class="actions">
            <button type="button" id="close-btn">Ho capito</button>
          </div>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    const overlay = this.shadowRoot.querySelector(".overlay");
    const dialog = this.shadowRoot.querySelector(".dialog");
    const closeBtn = this.shadowRoot.querySelector("#close-btn");
    const xBtn = this.shadowRoot.querySelector("#x-btn");

    closeBtn?.addEventListener("click", this._close);
    xBtn?.addEventListener("click", this._close);

    // Chiudi cliccando fuori dal pannello
    overlay?.addEventListener("click", (e) => {
      if (e.target === overlay) this._close();
    });

    // ESC per chiudere
    document.addEventListener("keydown", this._onKeyDown);

    // Focus iniziale per accessibilità
    queueMicrotask(() => dialog?.focus());
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKeyDown);
  }

  _onKeyDown(e) {
    if (e.key === "Escape") this._close();
  }

  _close() {
    // Se vuoi puoi anche emettere un evento per salvare la preferenza in localStorage
    this.dispatchEvent(new CustomEvent("policy:closed", { bubbles: true, composed: true }));
    this.remove();
  }
}

customElements.define("popup-policy", PopUpPolicy);

class HeaderComponent extends HTMLElement {
  static get observedAttributes() {
    return ["home-link", "projects-link", "about-link"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host { all: initial; }

        header{
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #111;
          color: #eee;
        }

        nav a{
          color: #eee;
          text-decoration: none;
          margin-left: 16px;
          font-weight: 600;
        }
        nav a:hover{ text-decoration: underline; }

        .logo a{
          font-size: 20px;
          font-weight: bold;
          color: #eee;
          text-decoration: none;
        }
        .logo a:hover{ text-decoration: underline; }
        @media (max-width: 480px) {
          header{
            flex-direction: column;
            gap: 12px;
          }
          nav a{
            margin-left: 0;
            margin-right: 16px;
          }
        } 

        @media (max-width: 320px) {
          nav a{
            margin-right: 12px;
            font-size: 14px;
          }
        } 
      </style>

      <header>
        <div class="logo"><a id="logoLink" href="#">Ed1628</a></div>
        <nav>
          <a id="homeLink" href="#">Home</a>
          <a id="projectsLink" href="#">Progetti</a>
          <a id="aboutLink" href="#">Chi sono</a>
        </nav>
      </header>
    `;
  }

  connectedCallback() {
    this.#syncLinks();
  }

  attributeChangedCallback() {
    this.#syncLinks();
  }

  #syncLinks() {
    const home = this.getAttribute("home-link") || "";
    const projects = this.getAttribute("projects-link") || "";
    const about = this.getAttribute("about-link") || "";

    this.shadowRoot.getElementById("logoLink").href = home;
    this.shadowRoot.getElementById("homeLink").href = home;
    this.shadowRoot.getElementById("projectsLink").href = projects;
    this.shadowRoot.getElementById("aboutLink").href = about;
  }
}

customElements.define("header-component", HeaderComponent);

class FooterComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host { all: initial; }

        footer{
          text-align: center;
          padding: 16px;
          background: #111;
          color: #eee;
          font-size: 14px;
        }
        
        footer p{
          margin: 8px 0;
        }

        footer a{
          color: #eee;
          text-decoration: none;
          margin: 0 8px;
        }
        footer a:hover{ text-decoration: underline; }

        footer img{
          width: 20px;
          vertical-align: middle;
          filter: grayscale(100%) brightness(120%);
        }

        footer .author{
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
        }

        footer .author img{
          width: 40px;
          border-radius: 50%;
          filter: grayscale(100%) brightness(120%);
        }
      </style>

      <footer>
        <p>"Credo nelle connessioni dirette e nel lavoro condiviso. Non troverai profili social qui, ma mi trovi dove si costruisce davvero."</p>
        <p>
          <a href="https://discord.gg/6RXTsxZa" target="_blank" rel="noopener noreferrer" aria-label="Discord"><img src="../media/discord.png" alt="Discord"><code><</code>90's Code & Play<code>></code></a> | 
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><img src="../media/github.png" alt="GitHub">Ed1628</a>
        </p>
        <div class="author">
          <img src="../media/photo_profile.jpg" alt="Immagine dell'autore">
            <p>Realizzato da Ed1628 con <span aria-label="Cuore">❤️</span> e un po' di magia digitale.</p>
        </div>
        &copy; 2024 Ed1628. Tutti i diritti riservati.
      </footer>
    `;
  }
}

customElements.define("footer-component", FooterComponent);

class SectionComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host { all: initial; }

        section{
          max-width: 960px;
          margin: 24px auto;
          padding: 0 16px;
          color: #eee;
          justify-content: center;
          align-items: center;
        }
        
        section h2{
          font-size: 24px;
          margin-bottom: 8px;
          color: #3498db;
          text-align: center;
        }

        section p{
          font-size: 18px;
          margin-top: 0;
          color: #eee;
          text-align: center;
        }

        section img {
            width: 300px;
            border-radius: 50%;
            margin: 16px 50%;
            transform: translateX(-50%);
        }
      </style>

      <section>
      <h2><slot name="title"></slot></h2>
      <img src="../media/logoEP-inverse.png" alt="Immagine dello studio">
      <p><slot name="description"></slot></p>

      <slot></slot>
      </section>
    `;
  }
}

customElements.define("section-component", SectionComponent);


class SectionComponentAbout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host { all: initial; }

        section{
          max-width: 960px;
          margin: 24px auto;
          padding: 0 16px;
          color: #eee;
          justify-content: center;
          align-items: center;
        }
        
        section h2{
          font-size: 24px;
          margin-bottom: 8px;
          color: #3498db;
          text-align: center;
        }

        section p{
          font-size: 18px;
          margin-top: 0;
          color: #eee;
          text-align: center;
        }

        section img {
            width: 300px;
            border-radius: 50%;
            margin: 16px 50%;
            transform: translateX(-50%);
        }
      </style>

      <section>
      <h2><slot name="title"></slot></h2>
      <p><slot name="description"></slot></p>

      <slot></slot>
      </section>
    `;
  }
}

customElements.define("section-component-about", SectionComponentAbout);

class ImagesComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host { all: initial; }

        .gallery{
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
          margin: 24px auto;
          max-width: 960px;
        }

        .gallery img{
          width: calc(33% - 10px);
          border-radius: 8px;
        }

        @media (max-width: 600px) {
          .gallery img{
            width: calc(50% - 8px);
          }
        }
      </style>

      <div class="gallery">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("images-component", ImagesComponent);

class ChatBotComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.state = {
      open: false,
      db: null,
      loading: false,
    };

    // attributo per configurare il path del json
    this.dbUrl = this.getAttribute("db-url") || "chatbot-db.json";

    this.shadowRoot.innerHTML = `
      <style>
        :host { all: initial; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }

        .fab{
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          background: #3498db;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
          z-index: 10000;
          user-select: none;
          box-shadow: 0 10px 25px rgba(0,0,0,.2);
        }

        .panel{
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 320px;
          max-height: 420px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 12px 35px rgba(0,0,0,.25);
          overflow: hidden;
          z-index: 10000;
          display: none;
          border: 1px solid #eaeaea;
        }
        .panel.open{ display: flex; flex-direction: column; }

        .header{
          background: #3498db;
          color: #fff;
          padding: 10px 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .close{
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 4px 8px;
          border-radius: 8px;
        }
        .close:hover{ background: rgba(255,255,255,.15); }

        .messages{
          padding: 10px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #fafafa;
        }

        .msg{
          max-width: 85%;
          padding: 8px 10px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.35;
          border: 1px solid #eee;
          background: #fff;
        }
        .msg.user{
          align-self: flex-end;
          background: #e8f4ff;
          border-color: #d3ecff;
        }
        .msg.bot{
          align-self: flex-start;
        }

        .msg img{
          display: block;
          margin-top: 8px;
          max-width: 100%;
          border-radius: 10px;
          border: 1px solid #eee;
        }

        .composer{
          display: flex;
          gap: 8px;
          padding: 10px;
          background: #fff;
          border-top: 1px solid #eee;
        }
        input{
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 10px;
          font-size: 14px;
          outline: none;
        }
        button{
          border: 0;
          background: #3498db;
          color: #fff;
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
          font-weight: 600;
        }
        button:disabled{
          opacity: .6;
          cursor: not-allowed;
        }
        .hint{
          font-size: 12px;
          color: #666;
          padding: 0 10px 10px;
          background: #fff;
        }

        @media (max-width: 320px) {
          .fab{
            width: 50px;
            height: 50px;
            font-size: 24px;
            position: fixed;
            right: 16px;
            bottom: 16px;
          }
          .panel{
            width: calc(100% - 48px);
            right: 24px;
            bottom: 80px;
          }
        }
        
      </style>

      <div class="fab" title="ChatBot" aria-label="Apri chatbot">💬</div>

      <div class="panel" role="dialog" aria-label="Chatbot">
        <div class="header">
          <div>Ed 1628 EP Art Studio</div>
          <div class="close" title="Chiudi">✕</div>
        </div>

        <div class="messages"></div>

        <div class="composer">
          <input type="text" placeholder="Scrivi un messaggio..." />
          <button>Invia</button>
        </div>
        <div class="hint" part="hint"></div>
      </div>
    `;

    this.$fab = this.shadowRoot.querySelector(".fab");
    this.$panel = this.shadowRoot.querySelector(".panel");
    this.$close = this.shadowRoot.querySelector(".close");
    this.$messages = this.shadowRoot.querySelector(".messages");
    this.$input = this.shadowRoot.querySelector("input");
    this.$btn = this.shadowRoot.querySelector("button");
    this.$hint = this.shadowRoot.querySelector(".hint");
  }

  connectedCallback() {
    this.$fab.addEventListener("click", () => this.toggle());
    this.$close.addEventListener("click", () => this.close());

    this.$btn.addEventListener("click", () => this.onSend());
    this.$input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.onSend();
    });

    // messaggio iniziale
    this.addBotMessage("Ciao! Benvenuto chiedi pure a Ed-bot.");
  }

  async ensureDbLoaded() {
    if (this.state.db || this.state.loading) return;
    this.state.loading = true;
    this.setHint(`Caricamento DB da: ${this.dbUrl}`);

    try {
      const res = await fetch(this.dbUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.state.db = await res.json();
      this.setHint("");
    } catch (err) {
      console.error("Errore caricamento JSON:", err);
      this.setHint("Errore: impossibile caricare il database JSON.");
      this.state.db = {
        items: [],
        fallback: { a: "Database non disponibile.", img: null }
      };
    } finally {
      this.state.loading = false;
    }
  }

  open() {
    this.state.open = true;
    this.$panel.classList.add("open");
    this.$input.focus();
    // carica il db quando apri
    this.ensureDbLoaded();
  }

  close() {
    this.state.open = false;
    this.$panel.classList.remove("open");
  }

  toggle() {
    this.state.open ? this.close() : this.open();
  }

  setHint(text) {
    this.$hint.textContent = text || "";
  }

  normalize(s) {
    return (s || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  findAnswer(userText) {
    const db = this.state.db;
    const t = this.normalize(userText);

    // match semplice: se il testo include una delle frasi trigger
    for (const item of (db?.items || [])) {
      for (const q of (item.q || [])) {
        const qq = this.normalize(q);
        if (qq && (t === qq || t.includes(qq) || qq.includes(t))) {
          return { a: item.a, img: item.img || null };
        }
      }
    }

    return db?.fallback || { a: "Non ho capito.", img: null };
  }

  addMessage({ who, text, img }) {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.textContent = text;

    if (img) {
      const image = document.createElement("img");
      image.src = img;
      image.alt = "Immagine di risposta";
      div.appendChild(image);
    }

    this.$messages.appendChild(div);
    this.$messages.scrollTop = this.$messages.scrollHeight;
  }

  addUserMessage(text) {
    this.addMessage({ who: "user", text });
  }

  addBotMessage(text, img = null) {
    this.addMessage({ who: "bot", text, img });
  }

  async onSend() {
    const text = this.$input.value.trim();
    if (!text) return;

    this.$input.value = "";
    this.addUserMessage(text);

    await this.ensureDbLoaded();
    const ans = this.findAnswer(text);

    this.addBotMessage(ans.a, ans.img);
  }
}

customElements.define("chatbot-component", ChatBotComponent);

class IconsDevComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host { all: initial; }

        .icons{
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          margin: 24px auto;
        }

        .icons img{
          width: 48px;
          filter: grayscale(100%) brightness(120%);
        }
      </style>

      <div class="icons">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("icons-dev", IconsDevComponent);
