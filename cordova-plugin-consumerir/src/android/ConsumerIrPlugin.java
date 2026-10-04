package com.etech.consumerir;

import android.content.Context;
import android.hardware.ConsumerIrManager;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

public class ConsumerIrPlugin extends CordovaPlugin {

    private ConsumerIrManager irManager;

    @Override
    protected void pluginInitialize() {
        irManager = (ConsumerIrManager) cordova.getActivity()
                .getSystemService(Context.CONSUMER_IR_SERVICE);
    }

    @Override
    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext)
            throws JSONException {

        if ("hasIrEmitter".equals(action)) {
            boolean tem = irManager != null && irManager.hasIrEmitter();
            callbackContext.success(tem ? 1 : 0);
            return true;
        }

        if ("transmit".equals(action)) {
            if (irManager == null || !irManager.hasIrEmitter()) {
                callbackContext.error("Este aparelho não possui emissor infravermelho.");
                return true;
            }

            final int frequencia = args.getInt(0);
            JSONArray lista = args.getJSONArray(1);
            final int[] padrao = new int[lista.length()];
            for (int i = 0; i < padrao.length; i++) {
                padrao[i] = lista.getInt(i);
            }

            // transmit() é síncrono, então roda fora da thread principal
            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    try {
                        irManager.transmit(frequencia, padrao);
                        callbackContext.success();
                    } catch (Exception e) {
                        callbackContext.error("Falha ao transmitir: " + e.getMessage());
                    }
                }
            });
            return true;
        }

        return false;
    }
}