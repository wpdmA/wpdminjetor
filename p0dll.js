const ver = "V3.1.2";

/* Features */
window.features = {
    questionSpoof: true,
    autoAnswer: true,
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
    alert("❌ Falha: execute no site da Khan Academy (https://pt.khanacademy.org/)");
    window.location.href = "https://pt.khanacademy.org/";
}

/* Loader */
async function loadScript(url,label){
    return fetch(url).then(r=>r.text()).then(s=>{ eval(s); sendToast(`🪝 ${label} carregado`); });
}
async function loadCss(url){ return new Promise(res=>{ const l=document.createElement("link"); l.rel="stylesheet"; l.href=url; l.onload=()=>res(); document.head.appendChild(l); }); }

/* Start */
(async()=>{
    // estilos
    await loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css');
    await loadScript('https://cdn.jsdelivr.net/npm/toastify-js','toastify');
    sendToast("🌿 Script injetado com sucesso!");

    // funções principais (urls alteradas)
    await loadScript('https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/questionSpoof.js','questionSpoof');
    await loadScript('https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/answerRevealer.js','answerRevealer');
    await loadScript('https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/autoAnswer.js','autoAnswer');

    console.clear();
})();
