const ver = "7799";
let isDev = false;
const repoPath = `https://raw.githubusercontent.com/Niximkk/Khanware/refs/heads/${isDev ? "dev/" : "main/"}`;

/* CONFIG */
window.features = {
    questionSpoof: true,
    autoAnswer: true,
};
window.featureConfigs = {
    autoAnswerDelay: 3,
};

/* HELPERS */
const delay = ms => new Promise(res => setTimeout(res, ms));
const playAudio = url => { new Audio(url).play(); };
function sendToast(text, duration=5000, gravity='bottom', icon=null) {
    const o = Toastify({ text, duration, gravity, position:"center", stopOnFocus:true, style:{ background:"#000",fontSize:"16px",fontFamily:"Arial, sans-serif",color:"#fff",padding:"10px 20px",borderRadius:"5px",display:"flex",alignItems:"center"}});
    if(icon){const e=document.createElement("img");e.src=icon;e.style.width="20px";e.style.height="20px";e.style.marginRight="10px";o.toastElement.prepend(e)}
    o.showToast();
}

/* SPLASH */
async function showSplashScreen(){
    const e=document.createElement("div");
    e.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:#000;display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity .5s ease;user-select:none;color:white;font-family:MuseoSans,sans-serif;font-size:30px;text-align:center;";
    e.innerHTML='<span style="color:white;">WeLL </span><span style="color:#00ff00;">Bypass</span>';
    document.body.appendChild(e);
    setTimeout(()=>e.style.opacity="1",10);
    await delay(2000);
    e.style.opacity="0";
    await delay(1000);
    e.remove();
}

/* LOADERS */
async function loadScript(url,label){return fetch(url).then(r=>r.text()).then(code=>{eval(code);console.log(`🪝 ${label} loaded`);});}
async function loadCss(url){return new Promise(res=>{const l=document.createElement("link");l.rel="stylesheet";l.type="text/css";l.href=url;l.onload=()=>res();document.head.appendChild(l);});}

/* MAIN */
function setupMain(){
    if(window.features.questionSpoof) loadScript(repoPath+"functions/questionSpoof.js","questionSpoof");
    if(window.features.autoAnswer) loadScript(repoPath+"functions/autoAnswer.js","autoAnswer");
    loadScript(repoPath+"functions/answerRevealer.js","answerRevealer");
    loadScript(repoPath+"functions/videoSpoof.js","videoSpoof");
}

/* INJECT */
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
    await showSplashScreen();
    setupMain();
    console.clear();
});
