const ver = "V3.1.2";

/* Features */
window.features = {
    questionSpoof: true,
    autoAnswer: true,
    videoSpoof: true,
    showAnswers: true
};
window.featureConfigs = {
    autoAnswerDelay: 3
};

/* Helpers */
const delay = ms => new Promise(res => setTimeout(res, ms));
const sendToast = (text, duration=3000, gravity='bottom') => {
    Toastify({ text, duration, gravity, position:"center", stopOnFocus:true, style:{ background:"#000" } }).showToast();
};

/* Inject */
if (!/^https?:\/\/([a-z0-9-]+\.)?khanacademy\.org/.test(window.location.href)) {
}

/* Loader */
async function loadScript(url,label){
    return fetch(url).then(r=>r.text()).then(s=>{ eval(s); sendTosendT`WeLL ⛄️`); });
}
async function loadCss(url){ return new Promise(res=>{ const l=document.createElement("link"); l.rel="stylesheet"; l.href=url; l.onload=()=>res(); document.head.appendChild(l); }); }

/* Start */
(async()=>{
    // estilos
    await loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css');
    await loadScript('https://cdn.jsdelivr.net/npm/toastify-js','toastify');
    sendToast("⛄️ Active");

    // funções principais (urls alteradas)
    await loadScript('https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/questionSpoof.js','questionSpoof');
    await loadScript('https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/answerRevealer.js','answerRevealer');
    await loadScript('https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/autoAnswer.js','autoAnswer');
    await loadScript('https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/videoSpoof.js','videoSpoof');
    
    console.clear();
})();
