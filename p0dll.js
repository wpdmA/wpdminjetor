const ver = "V3.1.2";
window.features = {
    questionSpoof: true,
    autoAnswer: true,
    videoSpoof: true,
    showAnswers: true
};
window.featureConfigs = { autoAnswerDelay: 3 };
let loadedPlugins = [];
const delay = ms => new Promise(res => setTimeout(res, ms));
const sendToast = (text, duration=3000, gravity='bottom') => {
    if (typeof Toastify === 'undefined') { try{ alert(text); }catch{}; return; }
    Toastify({ text, duration, gravity, position:"center", stopOnFocus:true, style:{ background:"#000" } }).showToast();
};
if (!/^https?:\/\/([a-z0-9-]+\.)?khanacademy\.org/.test(window.location.href)) {
    alert("Execute este script no site do Khan Academy (https://pt.khanacademy.org/)");
    window.location.href = "https://pt.khanacademy.org/";
}
async function loadCss(url){ return new Promise(res=>{ const l=document.createElement("link"); l.rel="stylesheet"; l.type="text/css"; l.href=url; l.onload=()=>res(); l.onerror=()=>res(); document.head.appendChild(l); }); }
async function loadScript(url,label){
    try{
        const r = await fetch(url);
        if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        const s = await r.text();
        // executar em contexto global
        (0,eval)(s);
        loadedPlugins.push(label||url);
        try{ sendToast(`🪝 ${label||url} carregado`,2000,'top'); }catch{}
        return true;
    }catch(err){
        console.error("loadScript error",url,err);
        try{ sendToast(`Erro ao carregar ${label||url}`,5000,'top'); }catch{}
        return false;
    }
}
(async()=>{
    await loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css');
    await loadScript('https://cdn.jsdelivr.net/npm/toastify-js','toastify');
    sendToast("⛄️ Active",3000,'top');

    const urls = {
        questionSpoof: 'https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/questionSpoof.js',
        answerRevealer: 'https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/answerRevealer.js',
        autoAnswer: 'https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/autoAnswer.js',
        videoSpoof: 'https://raw.githubusercontent.com/wpdmA/wpdminjetor/refs/heads/main/videoSpoof.js'
    };

    if(window.features.questionSpoof) await loadScript(urls.questionSpoof,'questionSpoof');
    if(window.features.showAnswers) await loadScript(urls.answerRevealer,'answerRevealer');
    if(window.features.autoAnswer) await loadScript(urls.autoAnswer,'autoAnswer');
    if(window.features.videoSpoof) await loadScript(urls.videoSpoof,'videoSpoof');

    sendToast("Sucess - ⛄️",3000,'bottom');
    console.clear();
})();
