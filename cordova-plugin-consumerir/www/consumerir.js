var exec = require('cordova/exec');

// Verifica se o aparelho tem emissor IR. success recebe 1 (sim) ou 0 (não).
exports.hasIrEmitter = function (success, error) {
    exec(success, error, 'ConsumerIr', 'hasIrEmitter', []);
};

// Envia um padrão de pulsos (array de microssegundos, alternando marca/espaço).
exports.transmit = function (frequencia, padrao, success, error) {
    exec(success, error, 'ConsumerIr', 'transmit', [frequencia, padrao]);
};