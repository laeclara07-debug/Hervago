HERVAGO PWA - PASOS DE ACTIVACION

1. Firebase Console > Authentication > Sign-in method: habilitar Anonymous.
2. Firebase Console > Cloud Messaging > Web Push certificates: generar una clave VAPID.
3. Abrir index.html y reemplazar REEMPLAZAR_CON_TU_CLAVE_PUBLICA_VAPID por la clave PUBLICA VAPID.
4. Publicar firestore.rules.
5. Instalar Firebase CLI, iniciar sesion y seleccionar el proyecto hervago.
6. Dentro de functions ejecutar npm install.
7. Desplegar Hosting, Firestore Rules y Functions.
8. Las notificaciones web requieren HTTPS. Firebase Hosting lo proporciona.
9. La funcion dailyClientRegistrationAlert corre a las 21:00 America/Mexico_City y NO envia nada si no hubo registros ese dia.
10. El modo "Solo una al dia" recibe el resumen diario; "Todo encendido" queda preparado para alertas adicionales; "Apagadas" desactiva el dispositivo.

IMPORTANTE SOBRE EL LIMITE DE 3 VECES:
Esta entrega limita el aviso de instalacion a 3 apariciones POR NAVEGADOR/DISPOSITIVO usando localStorage. Hacerlo literalmente por IP requiere una funcion HTTP/backend que observe la IP de la solicitud. No debe intentarse desde JavaScript del navegador ni guardar IPs en claro. Si se exige por IP, implementar hash salado del lado servidor y TTL/retencion limitada.
