const ver = "7777",
    featureConfigs = { initialDelay: 3e3, subsequentDelays: [300, 1500, 500, 2e3] };

window.features = { autoAnswer: !0, questionSpoof: !0 };

const delay = ms => new Promise(r => setTimeout(r, ms)),
    playAudio = url => { try { new Audio(url).play() } catch (e) { console.warn(e) } };

function sendToast(t, d = 5e3, g = "bottom", i = null, s = "16px", f = "Arial, sans-serif", c = "#ffffff") {
    const o = Toastify({
        text: t,
        duration: d,
        gravity: g,
        position: "center",
        stopOnFocus: !0,
        style: {
            background: "#000",
            fontSize: s,
            fontFamily: f,
            color: c,
            padding: "10px 20px",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center"
        }
    });
    if (i) {
        const e = document.createElement("img");
        e.src = i;
        e.style.width = "20px";
        e.style.height = "20px";
        e.style.marginRight = "10px";
        o.toastElement.prepend(e)
    }
    o.showToast()
}

// função auxiliar para clique
function clickElementOnce(el) {
    try {
        if (!el) return !1;
        if (el.getAttribute && el.getAttribute("data-well-clicked") === "true") return !1;
        el.click();
        el.setAttribute && el.setAttribute("data-well-clicked", "true");
        el.blur && el.blur();
        return !0;
    } catch (e) {
        console.error("clickElementOnce:", e);
        return !1;
    }
}

// intercepta fetch e força ter apenas 1 opção (correta)
function spoofQuestion() {
    const phrases = ["WeLL ⛄️", "WeLL ⛄️", "WeLL ⛄️"];
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
        const originalResponse = await originalFetch.apply(this, arguments);
        const clonedResponse = originalResponse.clone();

        try {
            const text = await clonedResponse.text();
            const responseObj = JSON.parse(text);

            if (responseObj?.data?.assessmentItem?.item?.itemData) {
                let itemData = JSON.parse(responseObj.data.assessmentItem.item.itemData);

                // força sempre pergunta "spoofada"
                if (itemData.question && itemData.question.content && itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
                    itemData.answerArea = {
                        calculator: !1,
                        chi2Table: !1,
                        periodicTable: !1,
                        tTable: !1,
                        zTable: !1
                    };
                    itemData.question.content = phrases[Math.floor(Math.random() * phrases.length)] + "[[☃ radio 1]]";

                    // 🚀 agora só 1 opção, que é a correta
                    itemData.question.widgets = {
                        "radio 1": {
                            options: {
                                choices: [
                                    { content: "Resposta correta.", correct: !0 }
                                ]
                            }
                        }
                    };

                    // guarda o texto correto globalmente
                    window.__WeLL_correctText = "Resposta correta.";

                    responseObj.data.assessmentItem.item.itemData = JSON.stringify(itemData);
                    sendToast("WeLL ⛄️", 1e3);

                    return new Response(JSON.stringify(responseObj), {
                        status: originalResponse.status,
                        statusText: originalResponse.statusText,
                        headers: originalResponse.headers
                    });
                }
            }
        } catch (e) {
            console.error("spoofQuestion parse:", e);
        }
        return originalResponse;
    }
}

// loop principal para clicar na única resposta
function autoAnswer() {
    (async () => {
        for (;;) {
            if (window.features.autoAnswer && window.features.questionSpoof) {
                await delay(featureConfigs.initialDelay);

                const allChoices = document.querySelectorAll("button, div, span, label");
                for (const el of allChoices) {
                    if (el.textContent && el.textContent.trim() === "Resposta correta.") {
                        if (clickElementOnce(el)) {
                            await delay(500);
                            break;
                        }
                    }
                }
            } else {
                await delay(1e3);
            }
        }
    })();
}

// loaders e splash
async function loadScript(t) {
    return fetch(t).then(e => e.text()).then(e => { eval(e) });
}
async function loadCss(t) {
    return new Promise(e => {
        const n = document.createElement("link");
        n.rel = "stylesheet";
        n.type = "text/css";
        n.href = t;
        n.onload = () => e();
        document.head.appendChild(n);
    });
}
async function showSplashScreen() {
    const e = document.createElement("div");
    e.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.5s ease;
        user-select: none;
        color: white;
        font-family: MuseoSans, sans-serif;
        font-size: 30px;
        text-align: center;
    `;
    e.innerHTML = '<span style="color:white;">WeLL </span><span style="color:#00ff00;">Bypass</span>';
    document.body.appendChild(e);
    setTimeout(() => e.style.opacity = "1", 10);
    await delay(2e3);
    e.style.opacity = "0";
    await delay(1e3);
    e.remove();
}

// proteção URL
if (!/^https?:\/\/pt\.khanacademy\.org/.test(window.location.href))
    alert("Falha"), window.location.href = "https://pt.khanacademy.org/";

// inicialização
loadScript("https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js").then(async () => {
    DarkReader.setFetchMethod(window.fetch);
    DarkReader.enable();
    sendToast("Active ⛄️", 5e3, "top", null, "20px", "Arial, sans-serif", "#00ff00");
    await delay(1e3);
    sendToast("🌑", 2e3, "bottom", "https://cdn.discordapp.com/attachments/1326756804889280553/1351333793306247220/6c0df6a95ea7f835588f586a11bdbd4e.png?ex=67d9ff2a&is=67d8adaa&hm=1992d77fc05bd65a4417da3e860cead36b2d62395a28f1b6598d43a0ab953cc0&");
});

loadCss("https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css");
loadScript("https://cdn.jsdelivr.net/npm/toastify-js").then(async () => {
    sendToast("Sucess - ⛄️", 5e3, "bottom");
    window.features.autoAnswer = !0;
    spoofQuestion(); // agora só injeta 1 opção
    autoAnswer();
    document.addEventListener("focus", e => { e.target.blur() }, !0);
    console.clear();
    await showSplashScreen();
});
