const ver="93",
featureConfigs={initialDelay:3000,subsequentDelays:[300,1500,500,2000]};
window.features={autoAnswer:true,questionSpoof:true};

const COOLDOWN = 4000; // cooldown global 4s

const delay=ms=>new Promise(res=>setTimeout(res,ms));
const playAudio=url=>{new Audio(url).play()};

// ---- Toast ----
function sendToast(t,d=5000,g="bottom",i=null,s="16px",f="Arial, sans-serif",c="#ffffff"){
    const o=Toastify({
        text:t,duration:d,gravity:g,position:"center",stopOnFocus:true,
        style:{background:"#000",fontSize:s,fontFamily:f,color:c,padding:"10px 20px",borderRadius:"5px",display:"flex",alignItems:"center"}
    });
    if(i){const img=document.createElement("img");img.src=i;img.style.width="20px";img.style.height="20px";img.style.marginRight="10px";o.toastElement.prepend(img);}
    o.showToast();
}

// ---- Click Robust ----
function simulateClickEvents(el){
    try{['pointerover','pointerenter','mouseover','mousedown','mouseup','click'].forEach(type=>el.dispatchEvent(new MouseEvent(type,{bubbles:true,cancelable:true,view:window}))); return true;}
    catch(e){console.error("simulateClickEvents:",e);return false;}
}
function clickElementOnce(el){
    try{
        if(!el) return false;
        if(el.getAttribute && el.getAttribute("data-well-clicked")==="true") return false;
        if(el.disabled || el.getAttribute("aria-disabled")==="true") return false;
        try{el.click()}catch(_){}
        simulateClickEvents(el);
        el.setAttribute && el.setAttribute("data-well-clicked","true");
        el.blur && el.blur();
        return true;
    }catch(e){console.error("clickElementOnce:",e);return false;}
}
function findClickableByTexts(texts){
    const parts=texts.map(t=>`//button[contains(normalize-space(.),"${t}")] | //*[@role="button" and contains(normalize-space(.),"${t}")] | //a[contains(normalize-space(.),"${t}")]`);
    const xpath=parts.join(" | ");
    try{return document.evaluate(xpath,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;}catch(e){return null;}
}
function findAndClickByClass(t){
    const el=document.getElementsByClassName(t)[0];
    if(!el) return false;
    clickElementOnce(el);
    try{if(el.textContent.includes("Mostrar resumo")){sendToast("Concluido - WeLL ⛄️",3000);playAudio("https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/4x5g14gj.wav");}}catch(_){}
    return true;
}

// ---- Load Helpers ----
async function loadScript(url){return fetch(url).then(r=>r.text()).then(js=>eval(js));}
async function loadCss(url){return new Promise(res=>{const l=document.createElement("link");l.rel="stylesheet";l.type="text/css";l.href=url;l.onload=res;document.head.appendChild(l);});}

// ---- Spoof Question ----
function spoofQuestion(){
    const phrases=["WeLL ⛄️","WeLL ⛄️","WeLL ⛄️"];
    const originalFetch=window.fetch;
    window.fetch=async function(input,init){
        const originalResponse=await originalFetch.apply(this,arguments),cloned=originalResponse.clone();
        try{
            const text=await cloned.text(),resp=JSON.parse(text);
            if(resp?.data?.assessmentItem?.item?.itemData){
                let itemData=JSON.parse(resp.data.assessmentItem.item.itemData);
                if(itemData.question.content[0]===itemData.question.content[0].toUpperCase()){
                    itemData.answerArea={calculator:false,chi2Table:false,periodicTable:false,tTable:false,zTable:false};
                    itemData.question.content=phrases[Math.floor(Math.random()*phrases.length)]+"[[☃ radio 1]]";
                    itemData.question.widgets={"radio 1":{options:{choices:[{content:"Resposta correta.",correct:true}]}}};
                    resp.data.assessmentItem.item.itemData=JSON.stringify(itemData);
                    window.__WeLL_correctText="Resposta correta.";
                    sendToast("WeLL ⛄️",1000);
                    return new Response(JSON.stringify(resp),{status:originalResponse.status,statusText:originalResponse.statusText,headers:originalResponse.headers});
                }
            }
        }catch(e){console.error(e);}
        return originalResponse;
    }
}

// ---- Auto Answer ----
async function autoAnswer(){
    const baseClasses=["_ssxvf9l","_s6zfc1u","_4i5p5ae","_1r8cd7xe","_1yok8f4"];
    const advanceTexts=['Verificar','Verificar resposta','Próxima pergunta','Próxima','Avançar','Continuar','Confirmar'];
    const correctTexts=['Resposta correta.','Resposta correta'];

    for(;;){
        if(!window.features.autoAnswer || !window.features.questionSpoof){await delay(COOLDOWN);continue;}
        await delay(featureConfigs.initialDelay);

        for(let i=0;i<baseClasses.length;i++){
            // espera até o item estar disponível
            let correct=null;
            for(let tryCount=0;tryCount<10;tryCount++){
                correct=findClickableByTexts(correctTexts);
                if(correct) break;
                await delay(500);
            }
            if(correct){
                clickElementOnce(correct);
                await delay(COOLDOWN);

                let advanced=false;
                for(let attempt=0;attempt<8;attempt++){
                    const avancar=findClickableByTexts(advanceTexts);
                    if(avancar && !avancar.disabled){
                        clickElementOnce(avancar);
                        advanced=true;
                        await delay(COOLDOWN);
                        break;
                    }
                    await delay(300);
                }
            }

            const clicked=findAndClickByClass(baseClasses[i]);
            if(clicked && i<baseClasses.length-1) await delay(featureConfigs.subsequentDelays[i%featureConfigs.subsequentDelays.length]);
        }
    }
}

// ---- Splash ----
async function showSplashScreen(){
    const e=document.createElement("div");
    e.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background-color:#000;display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity 0.5s ease;user-select:none;color:white;font-family: MuseoSans,sans-serif;font-size:30px;text-align:center;";
    e.innerHTML='<span style="color:white;">WeLL </span><span style="color:#00ff00;">Bypass</span>';
    document.body.appendChild(e);
    setTimeout(()=>e.style.opacity="1",10);
    await delay(2000);
    e.style.opacity="0";
    await delay(1000);
    e.remove();
}

// ---- Bootstrap ----
if(!/^https?:\/\/pt\.khanacademy\.org/.test(window.location.href)){
    alert("Falha");
    window.location.href="https://pt.khanacademy.org/";
}

loadScript("https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js").then(async()=>{
    DarkReader.setFetchMethod(window.fetch);DarkReader.enable();
    sendToast("Active ⛄️",5000,"top",null,"20px","Arial, sans-serif","#00ff00");
    await delay(1000);
    sendToast("🌑",2000,"bottom","https://cdn.discordapp.com/attachments/1326756804889280553/1351333793306247220/6c0df6a95ea7f835588f586a11bdbd4e.png");
});

loadCss("https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css");
loadScript("https://cdn.jsdelivr.net/npm/toastify-js").then(async()=>{
    sendToast("Sucess - ⛄️",5000,"bottom");
    window.features.autoAnswer=true;
    spoofQuestion();
    autoAnswer();
    document.addEventListener("focus",e=>{e.target.blur()},true);
    console.clear();
    await showSplashScreen();
});
