const ver = "78787",
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

// verifica se elemento está visível no viewport / não display:none / visibility != hidden
function isVisible(el) {
    if (!el || !(el instanceof Element)) return !1;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) return !1;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

function normalizeText(t) {
    return (t || "").replace(/\s+/g, " ").trim().toLowerCase();
}

// clica um elemento apenas 1 vez (marca com atributo)
function clickElementOnce(el) {
    try {
        if (!el || !isVisible(el)) return !1;
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

// procura pela opção correta DENTRO de um container (ou no document se container for document)
function findChoiceInContainer(container, expectedTexts = []) {
    if (!container) return null;
    const selectors = "button, label, div, span, li, a";
    const nodes = container.querySelectorAll ? container.querySelectorAll(selectors) : [];
    for (const node of nodes) {
        if (!isVisible(node)) continue;
        const text = normalizeText(node.textContent || "");
        if (!text) continue;
        for (const expected of expectedTexts) {
            const exp = normalizeText(expected);
            // aceitar igualdade exata ou contains (mais tolerante)
            if (text === exp || text.includes(exp)) {
                return node;
            }
        }
    }
    return null;
}

// tenta achar e clicar a resposta correta dentro do container de classe passada
function clickCorrectInClass(className, expectedTexts = []) {
    try {
        const container = document.getElementsByClassName(className)[0];
        if (!container) return !1;
        const choice = findChoiceInContainer(container, expectedTexts);
        if (choice) {
            return clickElementOnce(choice);
        }
        return !1;
    } catch (e) {
        console.error("clickCorrectInClass:", e);
        return !1;
    }
}

// procura globalmente pela resposta correta (fallback)
function clickCorrectGlobal(expectedTexts = []) {
    const choice = findChoiceInContainer(document, expectedTexts);
    if (choice) return clickElementOnce(choice);
    return !1;
}

// intercepta fetch e guarda o texto da opção correta na variável global __WeLL_correctText
function spoofQuestion() {
    const phrases = ["WeLL ⛄️", "WeLL ⛄️", "WeLL ⛄️"];
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
        let body;
        if (input instanceof Request) body = await input.clone().text();
        else if (init && init.body) body = init.body;

        const originalResponse = await originalFetch.apply(this, arguments);
        const clonedResponse = originalResponse.clone();

        try {
            const text = await clonedResponse.text();
            const responseObj = JSON.parse(text);

            if (responseObj?.data?.assessmentItem?.item?.itemData) {
                let itemData = JSON.parse(responseObj.data.assessmentItem.item.itemData);

                // se for pergunta tipo esperado, sobrescreve e guarda o texto correto
                if (itemData.question && itemData.question.content && itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
                    itemData.answerArea = {
                        calculator: !1,
                        chi2Table: !1,
                        periodicTable: !1,
                        tTable: !1,
                        zTable: !1
                    };
                    itemData.question.content = phrases[Math.floor(Math.random() * phrases.length)] + "[[☃ radio 1]]";
                    itemData.question.widgets = {
                        "radio 1": {
                            options: {
                                choices: [
                                    { content: "Resposta correta.", correct: !0 },
                                    { content: "Resposta Errada.", correct: !1 }
                                ]
                            }
                        }
                    };

                    // guarda o texto correto (usa-se esta variável para match no DOM)
                    try {
                        const choices = itemData.question.widgets["radio 1"].options.choices;
                        const correctChoice = choices.find(c => c.correct) || choices[0];
                        window.__WeLL_correctText = correctChoice.content || "Resposta correta.";
                    } catch (e) {
                        window.__WeLL_correctText = "Resposta correta.";
                    }

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
            // se parse falhar, ignora e retorna original
            console.error("spoofQuestion parse:", e);
        }
        return originalResponse;
    }
}

// loop principal que tenta clicar apenas NA opção que contém o texto correto (visível)
function autoAnswer() {
    (async () => {
        const baseClasses = ["_ssxvf9l", "_s6zfc1u", "_4i5p5ae", "_1r8cd7xe", "_1yok8f4"];
        for (;;) {
            if (window.features.autoAnswer && window.features.questionSpoof) {
                await delay(featureConfigs.initialDelay);

                // monta lista de textos esperados (usa a variável global setada no spoof)
                const expectedTexts = [];
                if (window.__WeLL_correctText) expectedTexts.push(window.__WeLL_correctText);
                // fallbacks sensíveis
                expectedTexts.push("Resposta correta.");
                expectedTexts.push("resposta correta"); // sem pontuação

                for (let i = 0; i < baseClasses.length; i++) {
                    const cls = baseClasses[i];

                    // tenta clicar dentro do container específico
                    let clicked = clickCorrectInClass(cls, expectedTexts);

                    // se não achou dentro do container, tenta globalmente (mas ainda apenas 1 clique)
                    if (!clicked) clicked = clickCorrectGlobal(expectedTexts);

                    // se clicou, aguarda o delay correspondente antes de seguir
                    if (clicked && i < baseClasses.length - 1) {
                        const nextDelay = featureConfigs.subsequentDelays[i % featureConfigs.subsequentDelays.length];
                        await delay(nextDelay);
                    } else {
                        // se não clicou, pequena pausa para não travar a CPU
                        await delay(200);
                    }
                }
            } else {
                await delay(1e3);
            }
        }
    })();
}

// pequenos utilitários de load
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

// splash etc
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

// se não estiver na URL esperada, redireciona (com alerta)
if (!/^https?:\/\/pt\.khanacademy\.org/.test(window.location.href))
    alert("Falha"), window.location.href = "https://pt.khanacademy.org/";

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
    spoofQuestion(); // intercepta e grava __WeLL_correctText
    autoAnswer();
    document.addEventListener("focus", e => { e.target.blur() }, !0);
    console.clear();
    await showSplashScreen();
});
