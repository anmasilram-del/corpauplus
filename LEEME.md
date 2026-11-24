# Corrector PAU 6 · modo ChatGPT

Aplicación web estática (PWA). Sin servidor de corrección, API, clave, facturación adicional ni Render/Netlify. Se usa la suscripción existente a ChatGPT para leer y corregir los exámenes, mediante intercambio manual de instrucciones, imágenes y JSON. No es una integración automática de ChatGPT Plus. No se ha incluido un segundo motor IA integrado en esta versión, para no depender de cuotas o claves de otro proveedor.

## Instalar una vez, sin comandos

1. Descarga y descomprime `Corrector_PAU_v6_ChatGPT.zip`.
2. Entra en https://github.com/new. Crea un repositorio NUEVO llamado `corrector-pau-plus`. Selecciona **Public** (GitHub Pages gratuito para repositorios públicos), activa Add a README si lo deseas y pulsa Create repository. NO subas apuntes, exámenes, fotos, copias de seguridad o notas: solo los archivos de código del ZIP.
3. En el repositorio, Add file > Upload files. Arrastra el contenido descomprimido, no la carpeta contenedora. `index.html`, `app.js`, `ui.css`, `core.mjs`, `exchange.mjs`, `backup.mjs`, `manifest.json`, `sw.js` y los iconos deben quedar en la raíz. `.nojekyll` es opcional para esta estructura si el sistema no lo muestra. Puedes subir también la documentación y pruebas sin datos reales.
4. Commit changes. Después entra en Settings > Pages. En Build and deployment, Source: Deploy from a branch; Branch: main; Folder: /(root). Save. GitHub proporcionará una dirección del tipo https://TU-USUARIO.github.io/corrector-pau-plus/ (ejemplo, no publicada por nosotros). Si no aparece, comprueba el estado de Pages o Actions. GitHub indica que la publicación puede tardar hasta diez minutos.
5. Abre la dirección real y revisa Ajustes: debe indicar almacenamiento operativo y contexto seguro. En Chrome Android, abre el menú de tres puntos y elige Instalar aplicación o Añadir a pantalla de inicio, según la versión del navegador. Abre el icono.
6. Realiza primero la prueba ficticia descrita abajo. No requiere claves de API ni contratar servicios.

Documentación oficial: https://docs.github.com/en/pages/quickstart y https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site .

## Primer examen y uso durante el curso

1. Preparar: crea una prueba, añade modelo, contenidos y rúbrica (archivos múltiples). Desde Android el selector puede mostrar Drive; en ordenador descarga previamente desde Drive. Guarda los materiales. La aplicación conserva copias locales, no sincroniza Drive.
2. Copia instrucciones y abre ChatGPT. Entra en tu proyecto PAU y abre un chat dedicado a esa prueba. Adjunta el modelo, los contenidos y la rúbrica. Si los mapas o diagramas están incluidos en un PDF, sube también las imágenes por separado: ChatGPT Plus puede no interpretar las imágenes incrustadas en PDF. Puedes recuperar los archivos locales con Ver archivos para adjuntar. No hace falta volver a adjuntar el temario por alumno mientras el contexto siga disponible.
3. ChatGPT devuelve un JSON de guía con identificador de prueba, contenidos, criterios y reparto. Pega solo el bloque JSON o importa el archivo JSON. Pulsa Comprobar guía. Si falta información o hay conflictos, acláralos en ChatGPT y solicita una nueva guía. Revisa apartados, puntuaciones, topónimos admitidos y criterios; confirma y bloquea. La guía suma 10 puntos. Si modificas la rúbrica, crea una prueba nueva y revisa las notas anteriores para mantener homogeneidad.
4. Fotos: selecciona la prueba, fotografía o importa páginas; arrastra rectángulos negros sobre datos personales. Comprueba que quedan totalmente cubiertos. La aplicación no detecta nombres automáticamente. Si te equivocas, quita la página y vuelve a importarla. Confirma cada página y guarda. El número se asigna al guardar, no se reutiliza al borrar pendientes. Anota el código en el papel o en un listado privado autorizado. No es necesario introducir nombres en la app.
5. Pendientes: abre el código. Copia las instrucciones y adjunta TODOS los JPG en el mismo chat de la prueba, ordenados por página. Puedes compartir archivos si el dispositivo lo admite; si no, descarga cada JPG. No se envía nada automáticamente. La app convierte la foto a JPEG mediante canvas, cubriendo los píxeles y sin conservar el archivo original dentro de la app. El móvil o la galería podrían conservar la foto original de forma independiente. Las fotos pendientes confirmadas sobreviven al cierre del navegador; las fotos todavía no guardadas se pierden al recargar.
6. Cuando ChatGPT devuelva el JSON, pégalo o impórtalo en esa ficha. El resultado debe coincidir con prueba, código y solicitud; la app comprueba el reparto y recalcula nota y ortografía. No pegues otro examen por error. Si un resultado falla, solicita que ChatGPT lo devuelva con el mismo esquema, sin cambiar identificadores.
7. Revisa las justificaciones, dudas, faltas y mapas. Puedes corregir puntos y desmarcar faltas. Un mapa vale cero o el máximo del apartado. Confirma la revisión y guarda. Se elimina la fotografía pendiente local, se conservan notas y justificaciones. El archivo descargado y la conversación de ChatGPT no se eliminan automáticamente.
8. Notas: exporta CSV (separador punto y coma, decimales con coma), con códigos, prueba, inicial, penalización y final. Para iDoceo, prueba la importación con un CSV ficticio y asigna los campos; no está verificada la integración directa.
9. Ajustes: exporta regularmente una copia cifrada (contraseña de 12 caracteres mínimo). Guárdala en almacenamiento autorizado, por ejemplo Drive institucional si el centro lo permite. Para cambiar de móvil u ordenador, restaura allí la copia: reemplaza los datos existentes, no los combina. No uses dos dispositivos simultáneamente como si sincronizaran. No borres los datos del navegador antes de guardar una copia.

## Normas de corrección
- Los contenidos aportados y la rúbrica son la base. Flexibilidad de formulación, rigor conceptual, crédito parcial. La IA debe solicitar material faltante y marcar dudas.
- Ortografía general: primeras dos faltas distintas sin penalizar; siguientes a −0,10, máximo −1. Repetidas y dudosas excluidas. La nota no baja de cero. Configuración de aula acordada, no una certificación de normativa PAU oficial.
- Cada topónimo de mapa es un apartado separado. Si está mal escrito (incluidas tildes o mayúsculas) o mal localizado, cero. Se admiten solo variantes autorizadas. No se cuenta también en la penalización general. El motor local verifica el texto transcrito, no puede comprobar por sí mismo la foto.
- La validación docente es obligatoria. No es una evaluación autónoma. Los avisos no son una garantía de que se hayan detectado todos los errores.

## Prueba inicial recomendada

Usa materiales y fotografías inventados, no datos reales. Prepara un examen sencillo de diez puntos (8 teoría, 2 localización de Sistema Ibérico). Genera la guía en ChatGPT, bloquea, fotografía un nombre ficticio y una respuesta de ejemplo, oculta el nombre, guarda, cierra y reabre la PWA, adjunta imágenes, importa el resultado. Comprueba que “Sistema Iberico” pierde 2 puntos y no vuelve a descontar ortografía general. Prueba el CSV, copia cifrada y restauración. Si alguna etapa falla, no la uses todavía con datos reales.

## Privacidad y limitaciones

El código es público; los datos no se publican en GitHub. IndexedDB local no cifrada; respaldo cifrado AES-GCM. No hay inicio de sesión en la web estática ni sincronización automática. Protege el dispositivo y usa un perfil privado o dedicado, y no compartas sus archivos. La aplicación no conserva el vínculo nombre-código: mantenlo separado y autorizado. La seudonimización no garantiza anonimato y el uso de ChatGPT Plus con trabajos del alumnado requiere revisión previa del centro/delegado de protección de datos. Comprueba la configuración de datos de ChatGPT y no envíes identificadores. GitHub Pages y ChatGPT tienen condiciones y límites que pueden cambiar. El modo gratuito significa sin coste adicional a tu suscripción existente, no uso ilimitado.

Pruebas: 37/37 del motor de intercambio, puntuación y respaldo, más comprobaciones estáticas. El navegador del entorno bloqueó la navegación local; no se ha validado el flujo en Android ni el envío real a ChatGPT. Ver RESULTADOS_PRUEBAS.txt. No se ha publicado el sitio.

La versión 6 usa una base de datos separada de las versiones 1–5 y no importa directamente sus copias. No sustituir una instalación con datos reales sin exportarlos primero.
