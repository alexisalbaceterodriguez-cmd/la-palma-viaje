# La Palma · Nuestro viaje (10–17 de octubre de 2026)

Web estática con mapa interactivo, vista flotante, temas día/noche y asistente «Mi ritmo».

**[Abrir web](https://alexisalbaceterodriguez-cmd.github.io/la-palma-viaje/)**

## «Mi ritmo» y el retraso del vuelo

- El retraso del vuelo de ida es **manual** y comienza en +90 minutos. No se conecta a datos de aerolíneas. En **Mi ritmo → Ajustes** se puede escribir directamente la hora prevista de aterrizaje o el retraso exacto en minutos. El cambio se conserva al recargar la página.
- El cálculo se hace en hora de **Canarias**. Solo se evalúa el día actual: al consultar otra fecha, se muestra planificación, no una falsa alarma.
- El PDF solo fija horarios para Tajogaite (12 octubre, 10:45–14:00), La Cumbrecita (13 octubre, 09:00–11:00, reserva por confirmar) y regreso (17 octubre, aeropuerto 14:50, coche antes de 16:00, vuelo 16:50).
- El resto de visitas tienen horarios flexibles. No se afirma que el viajero vaya tarde si no hay un compromiso real.
- GPS **con consentimiento**. Pulsar «Comprobar ubicación» permite obtener la posición en el navegador. Una consulta de ruta en coche envía origen y destino a la demo pública de OSRM. Estimación **sin tráfico en tiempo real**, sin garantías ni seguimiento de vuelos. No se guarda la posición en el servidor, solo en la memoria de la pestaña.
- «Actualizar mi posición mientras tenga la web abierta» es opcional. Se desactiva al cerrar la página. No se almacena el GPS. El retraso se guarda localmente en cada navegador.
- Si falla OSRM o no hay GPS, la web sigue mostrando itinerario y horarios sin inventar tiempos de conducción.

## Progreso por viajero

- **Mi progreso** permite crear perfiles por nombre y alternar entre ellos. Al abrir la web se restaura automáticamente el perfil activo en ese navegador.
- Cada perfil tiene su propia lista de paradas marcadas, con actualización inmediata del itinerario y del asistente **Mi ritmo**.
- Las marcas previas a la versión de perfiles se migran automáticamente al perfil inicial **Mi viaje**.
- El contenido se guarda mediante `localStorage`, sin servidor, base de datos, contraseña ni cookies de sesión. Otras pestañas abiertas en el mismo navegador reciben los cambios.
- **No existe sincronización entre distintos navegadores, teléfonos o dispositivos.** No hay recuperación si se borran los datos del sitio o se usa navegación privada. Los perfiles no constituyen una cuenta autenticada.
- El JavaScript y CSS de los perfiles se incluyen en la caché del service worker para uso sin conexión.

## Clima por zonas del itinerario (issue #1)

- Se muestra una tarjeta meteorológica para las zonas relevantes del día seleccionado, sin solicitar GPS ni modificar las rutas. En «Todos» se consultan cinco zonas representativas de la isla.
- Datos estimados de [Open-Meteo](https://open-meteo.com/) mediante su API pública. La integración usa temperatura, estado del cielo, viento y probabilidad de lluvia. Para fechas futuras dentro del horizonte disponible se presentan mínimos/máximos y previsión diaria; en otros casos se muestra el tiempo actual, claramente etiquetado.
- **El viaje fue del 10 al 17 de octubre de 2026.** Al consultar cualquiera de esas fechas después del viaje, se indica que los datos son del día de hoy, **no observaciones históricas de la fecha original**. El tiempo en la montaña puede variar muy rápidamente. No sustituye los avisos oficiales de AEMET.
- Se guarda un máximo de 72 horas de datos previos en `localStorage`, con la hora exacta de actualización en Canarias. Los datos se refrescan aproximadamente cada 30 minutos con la web visible y al pulsar «Actualizar». Si la API falla, se muestran los últimos datos válidos disponibles o un mensaje claro; las rutas siguen funcionando.
- Los archivos `weather.js` y `weather.css` se guardan en el service worker para uso offline de la interfaz. Las consultas de Open-Meteo **no** se guardan en el service worker; solo los resultados obtenidos previamente pueden mostrarse sin red.
- Se mantiene el despliegue estático en GitHub Pages. Comprueba las [condiciones de uso de Open-Meteo](https://open-meteo.com/en/terms) si cambia a un uso comercial o de alto volumen.

## Publicación

GitHub Pages despliega desde `main` mediante `.github/workflows/pages.yml`. No se necesita backend, base de datos ni clave API.
