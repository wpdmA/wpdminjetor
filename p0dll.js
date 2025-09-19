const ver = "V3.1.3";

/* Features */
window.features = {
    questionSpoof: true,
    autoAnswer: true,
    videoSpoof: true,
    showAnswers: true,
    nextRecomendation: false,
    repeatQuestion: false
};
window.featureConfigs = {
    autoAnswerDelay: 1222 // cooldown em ms
};

/* Helpers */
const delay = ms => new Promise(res => setTimeout(res, ms));
const sendToast = (text, duration=3000, gravity='bottom') => {
    if (typeof Toastify === 'undefined') { try{ console.log(text); }catch{}; return; }
    Toastify({ text, duration, gravity, position:"center", stopOnFocus:true, style:{ background:"#000" } }).showToast();
};
const playAudio = url => { new Audio(url).play(); };

/* Toastify */
(async()=>{
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";
    document.head.appendChild(css);

    await new Promise(res=>{
        const s=document.createElement("script");
        s.src="https://cdn.jsdelivr.net/npm/toastify-js";
        s.onload=()=>res();
        document.head.appendChild(s);
    });
    sendToast("⛄️ Script ativo!");
})();

/* VIDEO SPOOF */
const originalFetch = window.fetch;
window.fetch = async function (input, init) {
    let body;
    if (input instanceof Request) body = await input.clone().text();
    else if (init && init.body) body = init.body;

    // Video spoof
    if (features.videoSpoof && body && body.includes('"operationName":"updateUserVideoProgress"')) {
        try {
            let bodyObj = JSON.parse(body);
            if (bodyObj.variables && bodyObj.variables.input) {
                const durationSeconds = bodyObj.variables.input.durationSeconds;
                bodyObj.variables.input.secondsWatched = durationSeconds;
                bodyObj.variables.input.lastSecondWatched = durationSeconds;
                body = JSON.stringify(bodyObj);
                if (input instanceof Request) { input = new Request(input, { body: body }); } 
                else init.body = body; 
                sendToast("WeLL ⛄️", 1000);
            }
        } catch (e) { console.debug("Error", e); }
    }

    const originalResponse = await originalFetch.apply(this, arguments);
    const clonedResponse = originalResponse.clone();

    try {
        const responseBody = await clonedResponse.text();
        let responseObj = JSON.parse(responseBody);

        // Question spoof
        if (features.questionSpoof && responseObj?.data?.assessmentItem?.item?.itemData) {
            let itemData = JSON.parse(responseObj.data.assessmentItem.item.itemData);
            if(itemData.question.content[0] === itemData.question.content[0].toUpperCase()){
                itemData.answerArea = { "calculator": false, "chi2Table": false, "periodicTable": false, "tTable": false, "zTable": false }
                itemData.question.content = "WeLL ⛄️";
                itemData.question.widgets = { 
                    "radio 1": { 
                        type: "radio",  
                        options: { choices: [ 
                            { content: "Resposta correta.", correct: true }, 
                            { content: "Resposta incorreta.", correct: false } 
                        ] } 
                    } 
                };
                responseObj.data.assessmentItem.item.itemData = JSON.stringify(itemData);
                sendToast("WeLL ⛄️", 1000);
                return new Response(JSON.stringify(responseObj), { 
                    status: originalResponse.status, 
                    statusText: originalResponse.statusText, 
                    headers: originalResponse.headers 
                });
            }
        }
    } catch (e) { console.debug("Error", e); }

    return originalResponse;
};

/* AUTO ANSWER */
const baseSelectors = [
    `[data-testid="choice-icon__library-choice-icon"]`,
    `[data-testid="exercise-check-answer"]`, 
    `[data-testid="exercise-next-question"]`, 
    `._1udzurba`,
    `._awve9b`
];

function findAndClickBySelector(selector){
    const el = document.querySelector(selector);
    if (el) { el.click(); return true; }
    return false;
}

let khanwareDominates = true;
(async () => { 
    while (khanwareDominates) {
        if (features.autoAnswer && features.questionSpoof) {
            const selectorsToCheck = [...baseSelectors];
            if (features.nextRecomendation) selectorsToCheck.push("._hxicrxf");
            if (features.repeatQuestion) selectorsToCheck.push("._ypgawqo");

            for (const q of selectorsToCheck) {
                if(findAndClickBySelector(q)){
                    if (document.querySelector(q+"> div") && document.querySelector(q+"> div").innerText === "Mostrar resumo") {
                        sendToast("WeLL ⛄️", 3000);
                        playAudio("https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/4x5g14gj.wav");
                    }
                }
            }
        }
        await delay(window.featureConfigs.autoAnswerDelay);
    }
})();

/* ANSWER REVEALER */
const originalParse = JSON.parse;
JSON.parse = function (e, t) {
    let body = originalParse(e, t);
    try {
        if (body?.data) {
            Object.keys(body.data).forEach(key => {
                const data = body.data[key];
                if (features.showAnswers && key === "assessmentItem" && data?.item) {
                    const itemData = JSON.parse(data.item.itemData);
                    if (itemData.question && itemData.question.widgets && itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
                        Object.keys(itemData.question.widgets).forEach(widgetKey => {
                            const widget = itemData.question.widgets[widgetKey];
                            if (widget.options && widget.options.choices) {
                                widget.options.choices.forEach(choice => {
                                    if (choice.correct) {
                                        choice.content = " " + choice.content;
                                        sendToast("WeLL ⛄️", 1000);                
                                    }
                                });
                            }
                        });
                        data.item.itemData = JSON.stringify(itemData);
                    }
                }
            });
        }
    } catch (e) { console.debug("Error:", e); }
    return body;
};
