(function () {
  setUpMenu();
  setUpLightbox();
  setUpContactForm();
  setUpCopyButtons();

  function setUpMenu() {
    const button = document.querySelector(".menu-btn");
    const menu = document.getElementById("menu");
    if (!button || !menu) return;

    function setOpen(isOpen) {
      menu.hidden = !isOpen;
      button.textContent = isOpen ? "Close" : "Menu";
      button.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    button.addEventListener("click", () => setOpen(menu.hidden));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !menu.hidden) { setOpen(false); button.focus(); }
    });
    // Closes the menu if the viewport grows past the breakpoint while it's open.
    matchMedia("(min-width: 861px)").addEventListener("change", e => { if (e.matches) setOpen(false); });
  }

  function setUpLightbox() {
    const links = [...document.querySelectorAll(".photo a")];
    if (!links.length) return;

    const box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photograph viewer");
    box.innerHTML = `
      <div class="lb-bar"><span class="lb-count"></span><button class="lb-btn lb-close" type="button">Close</button></div>
      <div class="lb-stage">
        <img alt="">
        <p class="lb-message" hidden></p>
        <button class="lb-side prev" type="button" aria-label="Previous photograph"></button>
        <button class="lb-side next" type="button" aria-label="Next photograph"></button>
      </div>
      <div class="lb-bar"><span class="lb-caption"></span><span><button class="lb-btn lb-prev" type="button">Previous</button> / <button class="lb-btn lb-next" type="button">Next</button></span></div>`;
    document.body.appendChild(box);

    const img = box.querySelector(".lb-stage img");
    const message = box.querySelector(".lb-message");
    let index = 0;
    let lastFocus = null;

    function show() {
      const link = links[index];
      const thumb = link.querySelector("img");
      message.hidden = true;
      img.hidden = false;
      img.src = link.href;
      img.alt = thumb ? thumb.alt : "";
      box.querySelector(".lb-count").textContent = `${index + 1} of ${links.length}`;
      box.querySelector(".lb-caption").textContent = link.dataset.caption || "";
    }
    function open(i) {
      index = i;
      lastFocus = document.activeElement;
      box.hidden = false;
      document.body.style.overflow = "hidden";
      show();
      box.querySelector(".lb-close").focus();
    }
    function close() {
      box.hidden = true;
      img.removeAttribute("src");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    function step(delta) {
      index = (index + delta + links.length) % links.length;
      show();
    }

    img.addEventListener("error", () => {
      if (!img.getAttribute("src")) return;
      img.hidden = true;
      message.hidden = false;
      message.textContent = "This photograph didn't load. Check your connection, then press Next and Previous to try again.";
    });
    links.forEach((link, i) => link.addEventListener("click", e => { e.preventDefault(); open(i); }));
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelectorAll(".prev, .lb-prev").forEach(b => b.addEventListener("click", () => step(-1)));
    box.querySelectorAll(".next, .lb-next").forEach(b => b.addEventListener("click", () => step(1)));
    document.addEventListener("keydown", e => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });

    let touchStartX = null;
    const stage = box.querySelector(".lb-stage");
    stage.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", e => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      touchStartX = null;
    });
  }

  function setUpContactForm() {
    const form = document.querySelector(".contact-form");
    if (!form) return;
    const status = form.querySelector(".form-status");
    const send = form.querySelector(".send");
    const email = form.dataset.email;
    const emailHint = email ? ` You can also email ${email}.` : "";

    function setStatus(text, isError) {
      status.textContent = text;
      status.classList.toggle("is-error", isError);
    }
    function setFieldError(name, text) {
      const input = form.elements[name];
      input.closest(".field").classList.toggle("invalid", Boolean(text));
      input.setAttribute("aria-invalid", String(Boolean(text)));
      form.querySelector(`#err-${name}`).textContent = text;
    }
    function validate() {
      const name = form.elements.name.value.trim();
      const address = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();
      setFieldError("name", name ? "" : "Add your name so James knows who's writing.");
      setFieldError("email", /^\S+@\S+\.\S+$/.test(address) ? "" : "Enter an email address James can reply to, like name@example.com.");
      setFieldError("message", message.length >= 10 ? "" : "Write at least a sentence about what you need.");
      return form.querySelector(".invalid input, .invalid textarea");
    }

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const firstInvalid = validate();
      if (firstInvalid) { firstInvalid.focus(); return; }
      if (!form.getAttribute("action")) {
        setStatus(`This form isn't connected yet, so your message can't be sent.${emailHint}`, true);
        return;
      }
      send.disabled = true;
      send.textContent = "Sending…";
      setStatus("", false);
      try {
        const response = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!response.ok) {
          setStatus(`Your message wasn't sent: the form service returned error ${response.status}. Please try again in a few minutes.${emailHint}`, true);
          return;
        }
        const name = form.elements.name.value.trim().split(" ")[0];
        const address = form.elements.email.value.trim();
        form.reset();
        setStatus(`Thanks, ${name}. Your message has been sent and James will reply to ${address}.`, false);
      } catch {
        setStatus(`Your message wasn't sent because the connection dropped. Check you're online and press Send again.${emailHint}`, true);
      } finally {
        send.disabled = false;
        send.textContent = "Send message";
      }
    });
  }

  function setUpCopyButtons() {
    document.querySelectorAll("[data-copy]").forEach(button => {
      button.addEventListener("click", () => {
        const text = document.getElementById(button.dataset.copy).textContent;
        navigator.clipboard.writeText(text).then(
          () => { button.textContent = "Copied"; setTimeout(() => { button.textContent = "Copy"; }, 1500); },
          () => { button.textContent = "Select and copy the address"; }
        );
      });
    });
  }
})();
