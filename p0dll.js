const ver="91",featureConfigs={initialDelay:3e3,subsequentDelays:[300,1500,500,2e3]};
window.features={autoAnswer:!0,questionSpoof:!0};

const delay=ms=>new Promise(e=>setTimeout(e,ms)),playAudio=url=>{new Audio(url).play()};

function sendToast(t,d=5e3,g="bottom",i=null,s="16px",f="Arial, sans-serif",c="#ffffff"){
    const o=Toastify({
        text:t,
        duration:d,
        gravity:g,
        position:"center",
        stopOnFocus:!0,
        style:{
            background:"#000",
            fontSize:s,
            fontFamily:f,
            color:c,
            padding:"10px 20px",
            borderRadius:"5px",
            display:"flex",
            alignItems:"center"
        }
    });
    if(i){
        const e=document.createElement("img");
        e.src=i,e.style.width="20px",e.style.height="20px",e.style.marginRight="10px",o.toastElement.prepend(e)
    }
    o.showToast()
}

// ---- clique robusto ----
function simulateClickEvents(el){
  try{
    ['pointerover','pointerenter','mouseover','mousedown','mouseup','click'].forEach(type=>{
      el.dispatchEvent(new MouseEvent(type,{bubbles:!0,cancelable:!0,view:window}));
    });
    return true;
  }catch(e){console.error("simulateClickEvents:",e);return false;}
}

function clickElementOnce(el){
    try{
        if(!el)return!1;
        if(el.getAttribute&&el.getAttribute("data-well-clicked")==="true")return!1;
        if(el.disabled || el.getAttribute("aria-disabled")==="true")return false;
        try{el.click()}catch(_){}
        simulateClickEvents(el);
        el.setAttribute&&el.setAttribute("data-well-clicked","true");
        el.blur&&el.blur();
        return!0
    }catch(e){console.error("clickElementOnce:",e);return!1}
}

function findClickableByTexts(texts){
  const parts=texts.map(t=>{
    return `//button[contains(normalize-space(.),"${t}")] | //*[@role="button" and contains(normalize-space(.),"${t}")] | //a[contains(normalize-space(.),"${t}")]`;
  });
  const xpath=parts.join(" | ");
  try{
    return document.evaluate(xpath,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
  }catch(e){console.error("findClickableByTexts:",e);return null;}
}

function findAndClickByClass(t){
    const e=document.getElementsByClassName(t)[0];
    if(!e)return!1;
    clickElementOnce(e);
    try{
      if(e.textContent && e.textContent.includes("Mostrar resumo")){
        sendToast("Concluido - WeLL ⛄️",3e3);
        playAudio("https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/4x5g14gj.wav");
      }
    }catch(_){}
    return!0
}

async function loadScript(t,l){return fetch(t).then(e=>e.text()).then(e=>{eval(e)})}
async function loadCss(t){return new Promise(e=>{const n=document.createElement("link");n.rel="stylesheet",n.type="text/css",n.href=t,n.onload=()=>e(),document.head.appendChild(n)})}

function spoofQuestion(){
    const phrases=["WeLL ⛄️","WeLL ⛄️","WeLL ⛄️"],originalFetch=window.fetch;
    window.fetch=async function(input,init){
        const originalResponse=await originalFetch.apply(this,arguments),clonedResponse=originalResponse.clone();
        try{
            const text=await clonedResponse.text(),responseObj=JSON.parse(text);
            if(responseObj?.data?.assessmentItem?.item?.itemData){
                let itemData=JSON.parse(responseObj.data.assessmentItem.item.itemData);
                if(itemData.question.content[0]===itemData.question.content[0].toUpperCase()){
                    itemData.answerArea={calculator:!1,chi2Table:!1,periodicTable:!1,tTable:!1,zTable:!1};
                    itemData.question.content=phrases[Math.floor(Math.random()*phrases.length)]+"[[☃ radio 1]]";
                    itemData.question.widgets={"radio 1":{options:{choices:[{content:"Resposta correta.",correct:!0}]}}};
                    responseObj.data.assessmentItem.item.itemData=JSON.stringify(itemData);
                    window.__WeLL_correctText="Resposta correta.";
                    sendToast("WeLL ⛄️",1e3);
                    return new Response(JSON.stringify(responseObj),{
                        status:originalResponse.status,
                        statusText:originalResponse.statusText,
                        headers:originalResponse.headers
                    })
                }
            }
        }catch(e){console.error(e)}
        return originalResponse
    }
}

// ---- autoAnswer com cooldowns de 4s ----
async function autoAnswer(){
  (async()=>{
    const baseClasses=["_ssxvf9l","_s6zfc1u","_4i5p5ae","_1r8cd7xe","_1yok8f4"];
    const advanceTexts=['Verificar','Verificar resposta','Próxima pergunta','Próxima','Avançar','Continuar','Confirmar'];
    const correctTexts=['Resposta correta.','Resposta correta'];

    for(;;){
      if(!window.features.autoAnswer||!window.features.questionSpoof){
        await delay(1000);
        continue;
      }

      await delay(featureConfigs.initialDelay);

      for(let i=0;i<baseClasses.length;i++){
        const correct=findClickableByTexts(correctTexts);
        if(correct){
          clickElementOnce(correct);
          await delay(4000); // cooldown após marcar correta

          // tenta clicar no "Verificar"
          let advanced=false;
          for(let attempt=0;attempt<8;attempt++){
            const avancar=findClickableByTexts(advanceTexts);
            if(avancar){
              const isDisabled=avancar.disabled || avancar.getAttribute("aria-disabled")==="true" || (avancar.classList && /disabled/.test(avancar.className));
              if(!isDisabled){
                if(clickElementOnce(avancar)){
                  advanced=true;
                  await delay(4000); // cooldown após verificar antes da próxima
                  break;
                }
              }
            }
            await delay(300);
          }
          if(!advanced){
            for(let j=0;j<baseClasses.length;j++){
              if(findAndClickByClass(baseClasses[j])){advanced=true;break;}
            }
          }
        }
        const clicked=findAndClickByClass(baseClasses[i]);
        if(clicked&&i<baseClasses.length-1){
          const nextDelay=featureConfigs.subsequentDelays[i%featureConfigs.subsequentDelays.length];
          await delay(nextDelay);
        }
      }
    }
  })();
}

async function showSplashScreen(){
    const e=document.createElement("div");
    e.style.cssText="\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background-color: #000;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        z-index: 9999;\n        opacity: 0;\n        transition: opacity 0.5s ease;\n        user-select: none;\n        color: white;\n        font-family: MuseoSans, sans-serif;\n        font-size: 30px;\n        text-align: center;\n    ";
    e.innerHTML='<span style="color:white;">WeLL </span><span style="color:#00ff00;">Bypass</span>';
    document.body.appendChild(e);
    setTimeout(()=>e.style.opacity="1",10);
    await delay(2e3);
    e.style.opacity="0";
    await delay(1e3);
    e.remove()
}

// ---- bootstrap ----
if(!/^https?:\/\/pt\.khanacademy\.org/.test(window.location.href)){
    alert("Falha");
    window.location.href="https://pt.khanacademy.org/";
}

loadScript("https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js").then(async()=>{
    DarkReader.setFetchMethod(window.fetch),DarkReader.enable();
    sendToast("Active ⛄️",5e3,"top",null,"20px","Arial, sans-serif","#00ff00");
    await delay(1e3);
    sendToast("🌑",2e3,"bottom","https://cdn.discordapp.com/attachments/1326756804889280553/1351333793306247220/6c0df6a95ea7f835588f586a11bdbd4e.png?ex=67d9ff2a&is=67d8adaa&hm=1992d77fc05bd65a4417da3e860cead36b2d62395a28f1b6598d43a0ab953cc0&");
});

loadCss("https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css");

loadScript("https://cdn.jsdelivr.net/npm/toastify-js").then(async()=>{
    sendToast("Sucess - ⛄️",5e3,"bottom");
    window.features.autoAnswer=!0;
    spoofQuestion();
    autoAnswer();
    document.addEventListener("focus",e=>{e.target.blur()},!0);
    console.clear();
    await showSplashScreen();
});
