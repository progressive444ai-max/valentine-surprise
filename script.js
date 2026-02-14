// ─── Analytics ───
let dodgeCounter = 0;
let fullCycleCount = 0;

function track(event, data = {}) {
    fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, data }),
    }).catch(() => {});
}

// ─── Cards data ───
const cards = [
    { emoji: "🔥", text: "Мой огонь", subtext: "Моя мотивация и вдохновение" },
    { emoji: "🍑", text: "Моя жопка", subtext: "Самая красивая, между прочим" },
    { emoji: "🧩", text: "Моя половинка", subtext: "Без которой я не целый" },
    { emoji: "👑", text: "Моя королева", subtext: "Которой я готов отдать все свои силы" },
    { emoji: "🫠", text: "Моя зависимость", subtext: "От которой не хочу лечиться" },
    { emoji: "☀️", text: "Моё солнце", subtext: "Освещаешь даже самые серые дни" },
    { emoji: "💎", text: "Моё сокровище", subtext: "Бесценное и единственное" },
    { emoji: "🤪", text: "Моя сумасшедшая", subtext: "С которой никогда не скучно" },
];

let currentCard = 0;

// ─── Floating hearts ───
function createFloatingHearts() {
    const container = document.getElementById("heartsBg");
    const heartSymbols = ["❤", "💕", "💗", "💖", "♥", "💘"];

    setInterval(() => {
        const heart = document.createElement("span");
        heart.className = "floating-heart";
        heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        heart.style.left = Math.random() * 100 + "%";
        heart.style.fontSize = (Math.random() * 20 + 14) + "px";
        heart.style.animationDuration = (Math.random() * 6 + 6) + "s";
        container.appendChild(heart);

        setTimeout(() => heart.remove(), 12000);
    }, 400);
}

// ─── Screen transitions ───
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

// ─── Screen 1: "No" button dodge ───
function initNoButton() {
    const btnNo = document.getElementById("btnNo");
    const btnYes = document.getElementById("btnYes");
    let placeholderAdded = false;

    function dodgeNo() {
        // On first dodge, insert invisible placeholder so "Да" doesn't shift
        if (!placeholderAdded) {
            const rect = btnNo.getBoundingClientRect();
            const placeholder = document.createElement("div");
            placeholder.style.width = rect.width + "px";
            placeholder.style.height = rect.height + "px";
            placeholder.style.visibility = "hidden";
            btnNo.parentNode.insertBefore(placeholder, btnNo);
            placeholderAdded = true;
        }

        dodgeCounter++;
        track("btn_no_dodge", { count: dodgeCounter });

        // Jump away from cursor instantly (no transition)
        const rect = btnNo.getBoundingClientRect();
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 120 + 100;
        let newX = rect.left + Math.cos(angle) * distance;
        let newY = rect.top + Math.sin(angle) * distance;

        // Keep within screen bounds
        const pad = 20;
        newX = Math.max(pad, Math.min(newX, window.innerWidth - rect.width - pad));
        newY = Math.max(pad, Math.min(newY, window.innerHeight - rect.height - pad));

        btnNo.style.position = "fixed";
        btnNo.style.left = newX + "px";
        btnNo.style.top = newY + "px";
        btnNo.style.zIndex = "100";
        btnNo.style.transition = "none";
    }

    // Mouse — instant dodge
    btnNo.addEventListener("mouseenter", () => dodgeNo());
    // Touch (mobile)
    btnNo.addEventListener("touchstart", (e) => {
        e.preventDefault();
        dodgeNo();
    });
    // Click does nothing
    btnNo.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    btnYes.addEventListener("click", () => {
        track("btn_yes");
        goToCards();
    });
}

function goToCards() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => createBurstHeart(), i * 50);
    }
    setTimeout(() => {
        showScreen("screen2");
        initCards();
        track("card_view", { index: 1, total: cards.length, title: cards[0].text });
    }, 600);
}

function createBurstHeart() {
    const heart = document.createElement("span");
    heart.textContent = "❤️";
    heart.style.position = "fixed";
    heart.style.left = "50%";
    heart.style.top = "50%";
    heart.style.fontSize = (Math.random() * 30 + 20) + "px";
    heart.style.pointerEvents = "none";
    heart.style.zIndex = "1000";
    heart.style.transition = "all 0.8s ease-out";
    document.body.appendChild(heart);

    requestAnimationFrame(() => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 200 + 100;
        heart.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`;
        heart.style.opacity = "0";
    });

    setTimeout(() => heart.remove(), 1000);
}

// ─── Screen 2: Cards carousel ───
function initCards() {
    const container = document.getElementById("cardsContainer");
    const dotsContainer = document.getElementById("cardsDots");

    // Create cards
    cards.forEach((c, i) => {
        const card = document.createElement("div");
        card.className = "card" + (i === 0 ? " active" : "");
        card.innerHTML = `
            <div class="card-emoji">${c.emoji}</div>
            <div class="card-text">${c.text}</div>
            <div class="card-subtext">${c.subtext}</div>
        `;
        container.appendChild(card);

        const dot = document.createElement("div");
        dot.className = "dot" + (i === 0 ? " active" : "");
        dotsContainer.appendChild(dot);
    });

    // Swipe support
    let touchStartX = 0;
    container.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
    });
    container.addEventListener("touchend", (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextCard();
            else prevCard();
        }
    });

    document.getElementById("btnNext").addEventListener("click", nextCard);
}

function nextCard() {
    const allCards = document.querySelectorAll(".card");
    const allDots = document.querySelectorAll(".dot");

    if (currentCard >= cards.length - 1) {
        // Last card → go to greeting
        showScreen("screen3");
        launchConfetti();
        return;
    }

    allCards[currentCard].classList.remove("active");
    allCards[currentCard].classList.add("prev");
    allDots[currentCard].classList.remove("active");

    currentCard++;

    allCards[currentCard].classList.remove("next-card");
    allCards[currentCard].classList.add("active");
    allDots[currentCard].classList.add("active");

    track("card_view", { index: currentCard + 1, total: cards.length, title: cards[currentCard].text });
}

function prevCard() {
    if (currentCard <= 0) return;

    const allCards = document.querySelectorAll(".card");
    const allDots = document.querySelectorAll(".dot");

    allCards[currentCard].classList.remove("active");
    allCards[currentCard].classList.add("next-card");
    allDots[currentCard].classList.remove("active");

    currentCard--;

    allCards[currentCard].classList.remove("prev");
    allCards[currentCard].classList.add("active");
    allDots[currentCard].classList.add("active");

    track("card_view", { index: currentCard + 1, total: cards.length, title: cards[currentCard].text });
}

// ─── Screen 3: Confetti ───
function launchConfetti() {
    const container = document.getElementById("confetti");
    const colors = ["#e91e63", "#f48fb1", "#ff80ab", "#ff4081", "#c2185b", "#fce4ec", "#ffeb3b", "#ff5722"];
    const shapes = ["❤", "💕", "✨", "⭐", "🌹"];

    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const piece = document.createElement("span");
            piece.className = "confetti-piece";

            if (Math.random() > 0.5) {
                // Emoji confetti
                piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                piece.style.fontSize = (Math.random() * 16 + 12) + "px";
            } else {
                // Color square confetti
                piece.style.width = (Math.random() * 10 + 5) + "px";
                piece.style.height = (Math.random() * 10 + 5) + "px";
                piece.style.background = colors[Math.floor(Math.random() * colors.length)];
                piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
            }

            piece.style.left = Math.random() * 100 + "%";
            piece.style.animationDuration = (Math.random() * 2 + 2) + "s";
            container.appendChild(piece);

            setTimeout(() => piece.remove(), 4000);
        }, i * 50);
    }

    document.getElementById("btnGuess").addEventListener("click", () => {
        track("btn_guess");
        showScreen("screen4");
    });
}

// ─── Screen 4: Guess options ───
function initGuessOptions() {
    const clickedOptions = new Set();

    document.getElementById("guessOptions").addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-option");
        if (!btn) return;

        const option = btn.dataset.option;
        if (clickedOptions.has(option)) return;

        clickedOptions.add(option);

        const originalText = btn.textContent;

        // Show wrong state — red background
        btn.style.background = "linear-gradient(135deg, #ff8a80, #ff5252)";
        btn.style.color = "white";
        btn.style.border = "2px solid #ff5252";
        btn.style.pointerEvents = "none";

        // Clear button text and show "Не угадала!"
        btn.innerHTML = "❌ Не угадала!";

        track("guess_option", { option: originalText, clicked: clickedOptions.size });

        // After all 4 clicked → go to troll screen
        if (clickedOptions.size >= 4) {
            fullCycleCount++;
            track("full_cycle", { count: fullCycleCount });

            setTimeout(() => {
                showScreen("screen5");
                launchFinalConfetti();
            }, 1000);
        }
    });
}

function launchFinalConfetti() {
    const colors = ["#e91e63", "#f48fb1", "#ff80ab", "#c2185b", "#fce4ec"];

    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement("span");
            heart.textContent = "❤️";
            heart.style.position = "fixed";
            heart.style.fontSize = (Math.random() * 20 + 14) + "px";
            heart.style.left = Math.random() * 100 + "%";
            heart.style.top = "-20px";
            heart.style.pointerEvents = "none";
            heart.style.zIndex = "100";
            heart.style.animation = `confettiFall ${Math.random() * 3 + 3}s linear forwards`;
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 6000);
        }, i * 100);
    }
}

// ─── Init ───
document.addEventListener("DOMContentLoaded", () => {
    // Track visit
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    track("visit", { device: isMobile ? "📱 Телефон" : "💻 Компьютер" });

    createFloatingHearts();
    initNoButton();
    initGuessOptions();
});
