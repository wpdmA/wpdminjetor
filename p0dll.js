const ver = "7799";

// ========== CONFIG ==========
window.features = {
    questionSpoof: true,
    autoAnswer: true,
};
window.featureConfigs = {
    autoAnswerDelay: 3, // cooldown (em segundos)
};

// ========== HELPERS ==========
const delay = ms => new Promise(res => setTimeout(res, ms));
const playAudio = url => { new Audio(url).play(); };

function sendToast(text, duration=5000, gravity='bottom', icon=null) {
    const o = Toastify({
        text: text,
        duration: duration,
        gravity: gravity,
        position: "center",
        stopOnFocus: true,
        style: {
            background: "#000",
            fontSize: "16px",
            fontFamily: "Arial, sans-serif",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center"
        }
    });
    if (icon) {
        const e = document.createElement("img");
        e.src = icon;
        e.style.width = "20px";
        e.style.height = "20px";
        e.style.marginRight = "10px";
        o.toastElement.prepend(e);
    }
    o.showToast();
}

// clique robusto
function simulateClick(el){
    ['pointerover','pointerenter','mouseover','mousedown','mouseup','click']
        .forEach(type => el.dispatchEvent(new MouseEvent(type,{bubbles:true,cancelable:true,view:window})));
}

function clickElementOnce(el){
    try {
        if (!el) return false;
        if (el.getAttribute && el.getAttribute("data-well-clicked")==="true") return false;
        if (el.disabled || el.getAttribute("aria-disabled")==="true") return false;
        try { el.click(); } catch(_){}
        simulateClick(el);
        el.setAttribute && el.setAttribute("data-well-clicked","true");
        el.blur && el.blur();
        return true;
    } catch(e){ console.error("clickElementOnce:",e); return false; }
}

// ========== QUESTÃO: SPOOF ==========
function spoofQuestion() {
    const phrases = ["WeLL ⛄️","WeLL ⛄️","WeLL ⛄️"];
    const originalFetch = window.fetch;

    window.fetch = async function(input, init){
        const originalResponse = await originalFetch.apply(this, arguments);
        const cloned = originalResponse.clone();
        try {
            const text = await cloned.text();
            const responseObj = JSON.parse(text);
            if(responseObj?.data?.assessmentItem?.item?.itemData){
                let itemData = JSON.parse(responseObj.data.assessmentItem.item.itemData);

                // só spoofar se for uppercase (mesma lógica do Khanware)
                if(itemData.question?.content?.[0] === itemData.question.content[0].toUpperCase()){
                    itemData.answerArea = {calculator:false,chi2Table:false,periodicTable:false,tTable:false,zTable:false};
                    itemData.question.content = phrases[Math.floor(Math.random()*phrases.length)] + "[[☃ radio 1]]";
                    itemData.question.widgets = {
                        "radio 1": {
                            options: { choices: [{content:"Resposta correta.", correct:true}] }
                        }
                    };
                    responseObj.data.assessmentItem.item.itemData = JSON.stringify(itemData);
                    window.__WeLL_correctText = "Resposta correta.";

                    sendToast("WeLL ⛄️",1000);
                    return new Response(JSON.stringify(responseObj), {
                        status: originalResponse.status,
                        statusText: originalResponse.statusText,
                        headers: originalResponse.headers
                    });
                }
            }
        } catch(e){ console.error(e); }
        return originalResponse;
    };
}

// ========== QUESTÃO: AUTOANSWER ==========
async function autoAnswer(){
    const correctTexts = ["Resposta correta.","Resposta correta."];
    const advanceTexts = ["Verificar","Verificar resposta","Próxima pergunta","Próxima","Avançar","Continuar","Confirmar"];

    while(true){
        if(!window.features.autoAnswer || !window.features.questionSpoof){
            await delay(1000);
            continue;
        }

        try {
            // tenta encontrar a resposta correta
            const correctBtn = document.evaluate(
                `//button[contains(text(),'${correctTexts[0]}')]`,
                document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
            ).singleNodeValue;

            if(correctBtn){
                clickElementOnce(correctBtn);
                sendToast("WeLL ⛄️");

                await delay(window.featureConfigs.autoAnswerDelay*1000);

                // tenta clicar em verificar / próxima
                let avancar = null;
                for(const txt of advanceTexts){
                    avancar = document.evaluate(
                        `//button[contains(text(),'${txt}')]`,
                        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
                    ).singleNodeValue;
                    if(avancar) break;
                }

                if(avancar){
                    if(clickElementOnce(avancar)){
                        sendToast("WeLL ⛄️",1500);
                        await delay(window.featureConfigs.autoAnswerDelay*1000);
                    }
                }
            }
        } catch(e){
            console.error("autoAnswer loop:", e);
        }

        await delay(500);
    }
}

// ========== SPLASH ==========
async function showSplashScreen(){
    const e = document.createElement("div");
    e.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: #000; display: flex; align-items: center; justify-content: center;
        z-index: 9999; opacity: 0; transition: opacity 0.5s ease;
        user-select: none; color: white; font-family: MuseoSans, sans-serif; font-size: 30px; text-align: center;
    `;
    e.innerHTML='<span style="color:white;">WeLL </span><span style="color:#00ff00;">Bypass</span>';
    document.body.appendChild(e);
    setTimeout(()=>e.style.opacity="1",10);
    await delay(2000);
    e.style.opacity="0";
    await delay(1000);
    e.remove();
}

// ========== INJECT ==========
if(!/^https?:\/\/pt\.khanacademy\.org/.test(window.location.href)){
    alert("Falha");
    window.location.href="https://pt.khanacademy.org/";
}

loadScript("https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js").then(async()=>{
    DarkReader.setFetchMethod(window.fetch);
    DarkReader.enable();
    sendToast("Active ⛄️",5000,"top",null);
    await delay(1000);
    sendToast("🌑",2000,"bottom","https://cdn.discordapp.com/attachments/1326756804889280553/1351333793306247220/6c0df6a95ea7f835588f586a11bdbd4e.png");
});

loadCss("https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css");
loadScript("https://cdn.jsdelivr.net/npm/toastify-js").then(async()=>{
    sendToast("Sucess - ⛄️",5000,"bottom");
    spoofQuestion();
    autoAnswer();
    document.addEventListener("focus",e=>{e.target.blur()},true);
    console.clear();
    await showSplashScreen();
});

// utils
async function loadScript(t){ return fetch(t).then(e=>e.text()).then(e=>{eval(e)}); }
async function loadCss(t){ return new Promise(res=>{const n=document.createElement("link");n.rel="stylesheet";n.type="text/css";n.href=t;n.onload=()=>res();document.head.appendChild(n);}); }
