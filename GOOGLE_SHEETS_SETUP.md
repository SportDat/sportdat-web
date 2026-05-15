# Configuración de Google Sheets para formularios

## Paso 1: Crear la hoja de cálculo

1. Ve a [Google Sheets](https://sheets.google.com) y crea una nueva hoja
2. Nómbrala "SportDat - Leads"
3. En la primera fila (cabeceras), escribe:

```
Fecha | Formulario | Club | Contacto | Cargo | Email | Teléfono | Localidad | Equipos | Categorías | Narradores | Objetivo | Comentario | Página
```

## Paso 2: Crear el Apps Script

1. En la hoja, ve a **Extensiones → Apps Script**
2. Borra el código que aparece y pega este:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Map form fields to columns
    var row = [
      data._timestamp || new Date().toISOString(),
      data._form || '',
      data.club_name || data.name || '',
      data.contact_person || '',
      data.role || data.inquiry_type || '',
      data.email || '',
      data.phone || '',
      data.location || '',
      data.num_teams || '',
      data.categories || '',
      data.narrators || '',
      data.objective || '',
      data.comment || data.message || '',
      data._page || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Guarda (Ctrl+S) y ponle nombre al proyecto: "SportDat Forms"

## Paso 3: Desplegar como Web App

1. Haz clic en **Implementar → Nueva implementación**
2. Tipo: **Aplicación web**
3. Ejecutar como: **Yo** (tu cuenta)
4. Quién tiene acceso: **Cualquier persona**
5. Haz clic en **Implementar**
6. Copia la URL que te da (algo como `https://script.google.com/macros/s/AKfycb.../exec`)

## Paso 4: Configurar la URL en la web

En cada página HTML (`index.html`, `piloto-sportdat.html`, `contacto.html`), añade esta línea **antes** del `<script src="js/main.js">`:

```html
<script>window.SPORTDAT_SHEETS_URL = 'https://script.google.com/macros/s/TU_ID_AQUI/exec';</script>
```

Reemplaza `TU_ID_AQUI` con la URL real del paso 3.

## Listo

Cada vez que alguien envíe un formulario, aparecerá una nueva fila en tu Google Sheet con todos los datos.

## Notas

- No hay claves secretas que proteger — la URL del script es pública pero solo acepta POST
- Los datos se envían con `mode: 'no-cors'` para evitar problemas de CORS
- Si el envío falla (sin internet, etc.), el usuario igualmente ve el mensaje de éxito (graceful degradation)
- Puedes añadir notificaciones por email en Apps Script si quieres recibir un aviso por cada lead
