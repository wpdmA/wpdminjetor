const ver = "777 7 777";

// Configurações de atraso para as funcionalidades
const featureConfigs = {
    initialDelay: 3000,
    subsequentDelays: [300, 1500, 500, 2000]
};

// Configurações das funcionalidades
window.features = {
    autoAnswer: true,
    questionSpoof: true
};

// Função para criar um delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Função para reproduzir áudio
const playAudio = url => {
    const audio = new Audio(url);
    audio.play();
};

// Função para exibir um toast (notificação)
function sendToast(text, duration = 5000, gravity = 'bottom', imageUrl = null, fontSize = '16px', fontFamily = 'Arial, sans-serif', color = '#ffffff') {
    const toast = Toastify({
        text: text,
        duration: duration,
        gravity: gravity,
        position: "center",
        stopOnFocus: true,
        style: {
            background: "#000000",
            fontSize: fontSize,
            fontFamily: fontFamily,
            color: color,
            padding: '10px 20px',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center'
        }
    });

    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.width = '20px';
        img.style.height = '20px';
        img.style.marginRight = '10px';
        toast.toastElement.prepend(img);
    }

    toast.showToast();
}

function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

function findAndClickByText(text) {
    const buttons = document.querySelectorAll('button, div, span'); // Incluindo botões e elementos clicáveis

    for (const button of buttons) {
        if (button.textContent.trim().toLowerCase() === text.toLowerCase()) {
            button.click();
            button.blur();
            console.log(`Clicou no botão com texto: ${text}`);
            return true;
        }
    }
    return false;
}


// Função para encontrar e clicar em um elemento por classe
function findAndClickByClass(className) {
    const element = document.getElementsByClassName(className)[0];
    if (element) {
        element.click();
        element.blur();
        if (element.textContent.includes('Mostrar resumo')) {
            sendToast("Concluido - WeLL ⛄️", 3000);
            playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/4x5g14gj.wav');
        }
        return true;
    } else if (isMobile()) {
        // Se não achou a classe, tenta achar o botão por texto (só no mobile)
        return findAndClickByText('Verificar');
    }
    return false;
}

// Função para carregar um script externo
async function loadScript(url, label) {
    return fetch(url)
        .then(response => response.text())
        .then(script => {
            eval(script);
        });
}

// Função para carregar um arquivo CSS externo
async function loadCss(url) {
    return new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.onload = () => resolve();
        document.head.appendChild(link);
    });
}

// Função para modificar as questões (spoof)
function spoofQuestion() {
    const phrases = [
        "WeLL ⛄️",
        "WeLL ⛄️",
        "WeLL ⛄️"
    ];

    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
        let body;
        if (input instanceof Request) body = await input.clone().text();
        else if (init && init.body) body = init.body;

        const originalResponse = await originalFetch.apply(this, arguments);
        const clonedResponse = originalResponse.clone();

        try {
            const responseBody = await clonedResponse.text();
            let responseObj = JSON.parse(responseBody);

            if (responseObj?.data?.assessmentItem?.item?.itemData) {
                let itemData = JSON.parse(responseObj.data.assessmentItem.item.itemData);

                if (itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
                    itemData.answerArea = {
                        "calculator": false,
                        "chi2Table": false,
                        "periodicTable": false,
                        "tTable": false,
                        "zTable": false
                    };

                    itemData.question.content = phrases[Math.floor(Math.random() * phrases.length)] + `[[☃ radio 1]]`;
                    itemData.question.widgets = {
                        "radio 1": {
                            options: {
                                choices: [
                                    { content: "Resposta correta.", correct: true },
                                    { content: "Resposta Errada.", correct: false }
                                ]
                            }
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
        } catch (e) {
            console.error(e);
        }

        return originalResponse;
    };
}

// Função para responder automaticamente às questões
function autoAnswer() {
    (async () => {
        const baseClasses = ["_ssxvf9l", "_s6zfc1u", "_4i5p5ae", "_1r8cd7xe", "_1yok8f4"];

        while (true) {
            if (window.features.autoAnswer && window.features.questionSpoof) {
                await delay(featureConfigs.initialDelay);

                for (let i = 0; i < baseClasses.length; i++) {
                    const clicked = findAndClickByClass(baseClasses[i]);
                    if (clicked && i < baseClasses.length - 1) {
                        const nextDelay = featureConfigs.subsequentDelays[i % featureConfigs.subsequentDelays.length];
                        await delay(nextDelay);
                    }
                }
            } else {
                await delay(1000);
            }
        }
    })();
}

// Função para exibir a tela de inicialização
async function showSplashScreen() {
    const splashScreen = document.createElement('div');
    splashScreen.style.cssText = `
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
    splashScreen.innerHTML = '<span style="color:white;">WeLL </span><span style="color:#00ff00;">Bypass</span>';
    document.body.appendChild(splashScreen);
    setTimeout(() => splashScreen.style.opacity = '1', 10);

    await delay(2000);
    splashScreen.style.opacity = '0';
    await delay(1000);
    splashScreen.remove();
}

// Função para exibir o popup de doação
function showDonationPopup() {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #1e1e1e;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px #00ff00;
        z-index: 10000;
        text-align: center;
        color: white;
        font-family: Arial, sans-serif;
    `;
    popup.innerHTML = `
        <div style="position: absolute; top: 10px; right: 10px; cursor: pointer; color: red; font-size: 20px;" onclick="this.parentElement.remove(); showDiscordPopup();">×</div>
        <img src="https://i.imgur.com/t4mfuJU.png" alt="Logo" style="width: 100px; height: 100px; margin-bottom: 10px;">
        <h2 style="color: #00ff00; text-shadow: 0 0 5px #00ff00;">Contribua com o projeto</h2>
        <p style="font-size: 14px;">Sua ajuda é necessária para manter e atualizar o projeto. Qualquer doação é bem-vinda!</p>
        <button onclick="window.open('https://pixgg.com/im_snow', '_blank');" style="background-color: #00ff00; color: black; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px;">Doar</button>
    `;
    document.body.appendChild(popup);
}

// Função para exibir o popup do Discord
function showDiscordPopup() {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #1e1e1e;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px #00ff00;
        z-index: 10000;
        text-align: center;
        color: white;
        font-family: Arial, sans-serif;
    `;
    popup.innerHTML = `
        <div style="position: absolute; top: 10px; right: 10px; cursor: pointer; color: red; font-size: 20px;" onclick="this.parentElement.remove();">×</div>
        <img src="https://i.imgur.com/t4mfuJU.png" alt="Logo" style="width: 100px; height: 100px; margin-bottom: 10px;">
        <h2 style="color: #00ff00; text-shadow: 0 0 5px #00ff00;">Entre no nosso servidor</h2>
        <p style="font-size: 14px;">Junte-se à nossa comunidade no Discord para mais atualizações e suporte!</p>
        <button onclick="window.open('https://discord.gg/gamesdest', '_blank');" style="background-color: #00ff00; color: black; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px;">Entrar no servidor</button>
    `;
    document.body.appendChild(popup);
}

// Verifica se o script está sendo executado no site correto
if (!/^https?:\/\/pt\.khanacademy\.org/.test(window.location.href)) {
    alert("Falha");
    window.location.href = "https://pt.khanacademy.org/";
}

// Carrega o Dark Reader e ativa o modo escuro
loadScript('https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js').then(async () => {
    DarkReader.setFetchMethod(window.fetch);
    DarkReader.enable();

    // Exibe o aviso "HACK ATIVO ENTRE NA ATIVIDADE"
    sendToast("Active ⛄️", 5000, 'top', null, '20px', 'Arial, sans-serif', '#00ff00');

    // Aguarda 1 segundo antes de exibir o toast do Dark Mode
    await delay(1000);

    // Exibe o toast do Dark Mode com a imagem
    sendToast("🌑", 2000, 'bottom', 'https://cdn.discordapp.com/attachments/1326756804889280553/1351333793306247220/6c0df6a95ea7f835588f586a11bdbd4e.png?ex=67d9ff2a&is=67d8adaa&hm=1992d77fc05bd65a4417da3e860cead36b2d62395a28f1b6598d43a0ab953cc0&');
});

// Carrega o CSS do Toastify
loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css');

// Carrega o Toastify e inicia as funcionalidades
loadScript('https://cdn.jsdelivr.net/npm/toastify-js').then(async () => {
    sendToast("Sucess - ⛄️", 5000, 'bottom');
    window.features.autoAnswer = true;
    spoofQuestion();
    autoAnswer();
    document.addEventListener('focus', (event) => {
    event.target.blur();
    }, true);
    console.clear();
    // Exibe a tela de inicialização
    await showSplashScreen();
});
