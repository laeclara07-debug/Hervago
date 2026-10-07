const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Función programada que corre todos los días a las 8:30 PM (20:30 hrs)
 * Zona horaria: America/Mexico_City
 * 
 * Revisa la cantidad de personas/clientes registrados en el día:
 * - Si hay registros > 0: Envía una notificación push a todos los dispositivos suscritos.
 * - Si es 0: No envía nada.
 */
exports.resumenDiario830PM = functions.pubsub
  .schedule('30 20 * * *')
  .timeZone('America/Mexico_City')
  .onRun(async (context) => {
    const db = admin.firestore();

    // Obtener fecha actual en zona horaria America/Mexico_City (YYYY-MM-DD)
    const now = new Date();
    const mexicoDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);

    console.log(`[resumenDiario830PM] Verificando registros para la fecha: ${mexicoDateStr}`);

    // Consultar registros creados hoy en la colección 'clientRegistrations'
    const snapshot = await db.collection('clientRegistrations')
      .where('localDate', '==', mexicoDateStr)
      .get();

    const count = snapshot.size;

    // Regla estricta: Si en ese día no hay registros, no enviar nada
    if (count === 0) {
      console.log(`[resumenDiario830PM] 0 registros el día de hoy (${mexicoDateStr}). No se envía ninguna notificación.`);
      return null;
    }

    console.log(`[resumenDiario830PM] Se encontraron ${count} registro(s) hoy. Obteniendo dispositivos para enviar push...`);

    // Obtener todos los dispositivos registrados con tokens activos
    const devicesSnapshot = await db.collectionGroup('devices')
      .where('enabled', '==', true)
      .get();

    const tokens = [];
    devicesSnapshot.forEach((doc) => {
      const data = doc.data();
      // Enviar a dispositivos en modo 'all' o 'daily' (los que tienen token FCM)
      if ((data.mode === 'all' || data.mode === 'daily') && data.token) {
        tokens.push(data.token);
      }
    });

    // Eliminar tokens duplicados si los hubiera
    const uniqueTokens = [...new Set(tokens)];

    if (uniqueTokens.length === 0) {
      console.log('[resumenDiario830PM] No hay dispositivos con token FCM activo.');
      return null;
    }

    const payload = {
      notification: {
        title: 'Hervago · Resumen de las 8:30 PM',
        body: `Hoy se registraron ${count} cliente(s) nuevo(s) en el sistema.`
      },
      data: {
        type: 'daily_summary',
        count: String(count),
        date: mexicoDateStr
      },
      tokens: uniqueTokens
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(payload);
      console.log(`[resumenDiario830PM] Alertas enviadas con éxito: ${response.successCount} de ${uniqueTokens.length}`);

      // Opcional: limpiar tokens inválidos
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.warn(`Error enviando al token ${uniqueTokens[idx]}:`, resp.error);
          }
        });
      }
    } catch (error) {
      console.error('[resumenDiario830PM] Error enviando notificaciones push:', error);
    }

    return null;
  });

/**
 * Función HTTP para disparar una prueba manual de notificación sin esperar a las 8:30 PM
 */
exports.probarNotificacion = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  const devicesSnapshot = await db.collectionGroup('devices')
    .where('enabled', '==', true)
    .get();

  const tokens = [];
  devicesSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.token) tokens.push(data.token);
  });

  const uniqueTokens = [...new Set(tokens)];
  if (uniqueTokens.length === 0) {
    return res.status(200).send('No hay tokens de dispositivos activos registrados en Firestore.');
  }

  const payload = {
    notification: {
      title: 'Hervago · Prueba manual de notificación',
      body: 'Esta es una alerta de prueba enviada desde Cloud Functions.'
    },
    tokens: uniqueTokens
  };

  const response = await admin.messaging().sendEachForMulticast(payload);
  return res.status(200).json({
    enviados: response.successCount,
    fallidos: response.failureCount,
    total: uniqueTokens.length
  });
});
