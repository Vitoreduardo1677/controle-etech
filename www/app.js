// Endereço NEC do rádio E-Tech (0x00, com 0xFF invertido) e byte de comando de cada botão.
// null = código ainda não descoberto.
const ENDERECO_NEC = 0x00;
const COMANDOS_ETECH = {
    'POWER':      0x45,
    'MUTE':       0x47,
    'MODE':       0x46,
    'VOL_MAIS':   0x40,
    'VOL_MENOS':  0x19,
    'VOLTAR':     0x07,
    'EQ':         0x44,
    'HORA':       0x43,
    'AVANCAR':    0x09,
    'PLAY':       0x0C,
    'PASTA_MAIS': 0x5A,
    'PASTA_MENOS': 0x1C
};

// Monta os 32 bits NEC: endereço, ~endereço, comando, ~comando
function montarCodigoNEC(endereco, comando) {
    return (((endereco & 0xFF) << 24) | ((~endereco & 0xFF) << 16) |
            ((comando & 0xFF) << 8) | (~comando & 0xFF)) >>> 0;
}

// Converte o código em pulsos (microssegundos)
function converterHexParaMicrossegundos(hex) {
    const padraoOnda = [9000, 4500];
    for (let byteIndex = 3; byteIndex >= 0; byteIndex--) {
        const byte = (hex >>> (byteIndex * 8)) & 0xFF;
        for (let bit = 0; bit < 8; bit++) {
            const valor = (byte >> bit) & 1;
            padraoOnda.push(560);
            padraoOnda.push(valor ? 1690 : 560);
        }
    }
    padraoOnda.push(560, 39410);
    return padraoOnda;
}

function transmitir(codigo, nome) {
    const microssegundos = converterHexParaMicrossegundos(codigo);

    const led = document.getElementById('irLed');
    if (led) {
        led.classList.add('ir-active');
        setTimeout(() => led.classList.remove('ir-active'), 80);
    }

    if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.consumerir) {
        cordova.plugins.consumerir.transmit(
            38000,
            microssegundos,
            () => console.log(`Comando enviado para o rádio: ${nome}`),
            (erro) => console.error("Erro no emissor físico de IR:", erro)
        );
    } else {
        console.log(`[Modo Web] Disparado ${nome}. Pulsos gerados:`, microssegundos);
    }
}

function dispararSinal(comando) {
    const byte = COMANDOS_ETECH[comando];
    if (byte === undefined || byte === null) {
        console.error("Comando ainda não mapeado:", comando);
        return;
    }
    transmitir(montarCodigoNEC(ENDERECO_NEC, byte), comando);
}

// Clique envia uma vez; botões com data-repetir repetem enquanto pressionados
function configurarBotoes() {
    document.querySelectorAll('[data-comando]').forEach((botao) => {
        const comando = botao.dataset.comando;
        const repetir = botao.hasAttribute('data-repetir');
        let timer = null;

        const parar = () => {
            if (timer !== null) { clearInterval(timer); timer = null; }
        };

        botao.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            dispararSinal(comando);
            if (repetir) {
                parar();
                timer = setInterval(() => dispararSinal(comando), 150);
            }
        });

        ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => {
            botao.addEventListener(ev, parar);
        });

        botao.addEventListener('contextmenu', (e) => e.preventDefault());
    });
}

document.addEventListener('DOMContentLoaded', configurarBotoes);

document.addEventListener('deviceready', () => {
    console.log("Controle E-Tech integrado ao hardware do celular com sucesso.");
}, false);