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

## Publicación

GitHub Pages despliega desde `main` mediante `.github/workflows/pages.yml`. No se necesita backend, base de datos ni clave API.
