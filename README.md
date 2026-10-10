# La Palma · Nuestro viaje (10–17 de octubre de 2026)

Web estática con mapa interactivo, vista flotante, temas día/noche y asistente «Mi ritmo».

**[Abrir web](https://alexisalbaceterodriguez-cmd.github.io/la-palma-viaje/)**

## «Mi ritmo» y el retraso del vuelo

- El retraso del vuelo de ida es **manual** y comienza en +90 minutos, según la actualización de los viajeros. No se conecta a datos de aerolíneas. Es editable en **Mi ritmo → Ajustes**.
- El cálculo se hace en hora de **Canarias**. Solo se evalúa el día actual: al consultar otra fecha, se muestra planificación, no una falsa alarma.
- El PDF solo fija horarios para Tajogaite (12 octubre, 10:45–14:00), La Cumbrecita (13 octubre, 09:00–11:00, reserva por confirmar) y regreso (17 octubre, aeropuerto 14:50, coche antes de 16:00, vuelo 16:50).
- El resto de visitas tienen horarios flexibles. No se afirma que el viajero vaya tarde si no hay un compromiso real.
- GPS **con consentimiento**. Pulsar «Comprobar ubicación» permite obtener la posición en el navegador. Una consulta de ruta en coche envía origen y destino a la demo pública de OSRM. Estimación **sin tráfico en tiempo real**, sin garantías ni seguimiento de vuelos. No se guarda la posición en el servidor, solo en la memoria de la pestaña.
- «Actualizar mi posición mientras tenga la web abierta» es opcional. Se desactiva al cerrar la página. El retraso y las visitas marcadas se guardan solo en el navegador.
- Si falla OSRM o no hay GPS, la web sigue mostrando itinerario y horarios sin inventar tiempos de conducción.

## Publicación

GitHub Pages despliega desde `main` mediante `.github/workflows/pages.yml`. No se necesita backend, base de datos ni clave API.
