# Guía de Activación: PWA, Notificaciones y Alerta 8:30 PM — Hervago

Esta guía detalla los pasos exactos para activar las notificaciones push en dispositivos, la instalación PWA y la alerta diaria programada para las 8:30 PM.

---

## 1. Obtener la Clave Pública VAPID en Firebase

Para que el navegador y los dispositivos móviles permitan recibir notificaciones push en segundo plano, Firebase Cloud Messaging (FCM) requiere un par de claves Web Push (VAPID):

1. Ingresa a la [Consola de Firebase](https://console.firebase.google.com/).
2. Selecciona tu proyecto (`hervago`).
3. En la barra lateral izquierda, haz clic en el icono de engranaje ⚙️ junto a **Información general del proyecto** y elige **Configuración del proyecto**.
4. Ve a la pestaña superior llamada **Cloud Messaging**.
5. Desplázate hacia abajo hasta la sección **Configuración web** / **Certificados Web Push**.
6. Si aún no tienes un certificado generado, haz clic en el botón **Generar par de claves**.
7. Copia la cadena alfanumérica larga que aparece en la columna **Clave pública**.
8. Abre `index.html` (alrededor de la línea 1290) y sustituye:
   ```javascript
   const VAPID_PUBLIC_KEY = "REEMPLAZAR_CON_TU_CLAVE_PUBLICA_VAPID";
   ```
   por:
   ```javascript
   const VAPID_PUBLIC_KEY = "TU_CLAVE_PUBLICA_COPIADA";
   ```

---

## 2. Archivos Incluidos en este Paquete

| Archivo | Función |
| :--- | :--- |
| `index.html` | Interfaz principal con los 4 modos de notificación, botón de prueba instantánea, ventana flotante de instalación PWA limitada a 3 veces y programación a las 8:30 PM. |
| `firebase-messaging-sw.js` | Service Worker encargado de recibir y desplegar las notificaciones push en segundo plano en Android, Windows, Mac e iOS. |
| `manifest.webmanifest` | Manifiesto de la aplicación para permitir instalarla en el móvil o escritorio como App nativa (PWA). |
| `functions/index.js` | Cloud Function programada para ejecutarse a las 20:30 (8:30 PM, hora de México). Revisa si hubo registros hoy: si hay > 0, envía la notificación push; si es 0, no envía nada. |
| `functions/package.json` | Dependencias para Node.js 18 de Firebase Cloud Functions. |
| `firestore.rules` | Reglas de seguridad para Firestore que permiten guardar dispositivos y registrar nuevos clientes para el resumen. |
| `firebase.json` | Configuración del proyecto Firebase para despliegue de Functions, Firestore y Hosting. |

---

## 3. Despliegue de las Cloud Functions y Reglas

Para que la alerta de las 8:30 PM se envíe automáticamente **incluso con el teléfono o navegador cerrado**, se despliega la Cloud Function:

1. Asegúrate de tener instalado Firebase CLI en tu computadora:
   ```bash
   npm install -g firebase-tools
   ```
2. Inicia sesión en tu cuenta de Google:
   ```bash
   firebase login
   ```
3. Desde la carpeta donde están estos archivos, instala las dependencias de la función:
   ```bash
   cd functions
   npm install
   cd ..
   ```
4. Despliega las funciones y las reglas de seguridad:
   ```bash
   firebase deploy --only functions,firestore:rules
   ```

*Nota:* Para ejecutar Cloud Functions programadas (Cloud Scheduler), Firebase requiere el plan Blaze (de pago por uso, el cual tiene un nivel gratuito mensual muy generoso que cubre completamente este uso).

---

## 4. Modos de Notificación en el Sistema

En la pestaña **Configuración** del sistema, los usuarios encontrarán cuatro opciones:

1. 🔔 **Todo encendido**: Recibe notificaciones push en el teléfono/escritorio, ventanas flotantes dentro de la app y el resumen diario.
2. 🕘 **Solo una al día**: Silencia alertas intermedias y solo recibe el resumen de las 8:30 PM con la cantidad de personas registradas.
3. 🪟 **Solo ventana**: Para quienes no desean alertas en la barra del teléfono; únicamente muestra avisos dentro de la aplicación en formato ventana flotante.
4. 🔕 **Apagadas**: Suspende todo tipo de aviso en ese dispositivo.

---

## 5. Validación y Prueba Inmediata

No necesitas esperar a las 8:30 PM para comprobar que todo funciona:
- En la pestaña **Configuración**, haz clic en el botón **🔔 Probar alerta**.
- El sistema validará de inmediato el modo activo y desplegará la notificación en pantalla y en el sistema operativo si está permitido.
