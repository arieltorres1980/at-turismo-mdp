# AT Turismo y Traslados — sitio web

Sitio de una sola página para traslados y viajes desde Mar del Plata.
Está publicado en **https://www.attrasladosmdp.com.ar**.

El formulario de cotización no guarda nada: arma un mensaje y abre WhatsApp.

---

## Cómo agregar o sacar un evento de "Próximos eventos"

Hay **dos formas** de cargar los eventos y conviene elegir una sola:

| | Dónde se cargan | ¿Hay que publicar el sitio? |
|---|---|---|
| **A. Google Sheet** (recomendada) | Una planilla online, desde el celular o la computadora | **No.** El evento aparece solo en unos minutos |
| **B. Planilla de Excel del proyecto** | `data/eventos.xlsx` | Sí, hay que publicar el sitio |

Mientras no haya una Google Sheet configurada, el sitio usa la planilla de Excel
(opción B). En cuanto se pega el link de la hoja, **la hoja manda** y el Excel
queda solamente como respaldo.

---

## Opción A — cargar los eventos en una Google Sheet

Se hace **una sola vez** y después nunca más se toca código.

### 1. Crear la hoja a partir de la plantilla

1. Entrá a [drive.google.com](https://drive.google.com) con la cuenta del negocio.
2. **Nuevo → Subir archivo** y subí el archivo **`data/eventos-google-sheets.csv`**
   que está en el proyecto.
3. Cuando termine de subir, hacé **clic derecho sobre el archivo → Abrir con →
   Google Hojas de cálculo**. Se crea una planilla con las columnas ya puestas.
4. Ponele un nombre claro, por ejemplo **Eventos AT Turismo**.
5. Las filas de ejemplo vienen con **Activo = NO**, así que no se publican.
   Podés dejarlas como modelo o borrarlas.

### 2. Compartirla

Hay dos maneras, cualquiera sirve:

- **La más simple:** botón **Compartir** (arriba a la derecha) → en *Acceso
  general* elegí **"Cualquier persona con el enlace"** y, al lado, **"Lector"**
  → **Copiar vínculo**.
- **La otra:** **Archivo → Compartir → Publicar en la web**, elegí la hoja
  *Eventos*, formato **Valores separados por comas (.csv)**, **Publicar**, y
  copiá el link que te da.

> **Importante, leelo:** cualquier persona que tenga el link puede **LEER** la
> planilla, aunque no sepa de dónde salió. No cargues ahí nada privado
> (teléfonos de clientes, precios internos, direcciones particulares): solo lo
> que ya va a estar publicado en la web. **Modificarla** solo pueden quienes vos
> agregues con permiso de *Editor*, y "Lector" no alcanza para cambiar nada.

### 3. Pegar el link en el proyecto (una sola vez)

Abrí **`src/data/contact.json`** y pegá el link en el campo `eventsSheet`:

```json
"eventsSheet": "https://docs.google.com/spreadsheets/d/1AbC.../edit#gid=0"
```

Sirve tanto el link de *Compartir* como el de *Publicar en la web*: el sitio se
arregla para pedirle a Google el contenido de la hoja. Si lo dejás **vacío**
(`""`), el sitio vuelve a usar la planilla de Excel.

Después de este cambio hay que **publicar el sitio una vez** (ver más abajo).
De ahí en adelante, no más.

### 4. Cargar eventos, de ahí en adelante

Escribís la fila en la hoja (las columnas son las mismas que se explican en la
opción B) y listo: **el evento aparece solo en la web en unos minutos**, sin
publicar nada y sin avisarle a nadie. Lo mismo para corregir un dato o borrar
una fila.

### Cosas que conviene saber de la hoja

- **No cambies los nombres de los encabezados** (Título, Descripción, Día, Hora,
  Banner, Activo). Podés reordenarlos o agregar una columna tuya al final: el
  sitio busca las columnas por nombre.
- La **fecha** se escribe `14/11/2026`. Si Google te la convierte a otro formato
  igual se entiende, pero si querés estar seguro, escribila con un apóstrofo
  adelante (`'14/11/2026`) y queda como texto.
- **Si una fila está mal cargada** (falta la descripción, la fecha no se
  entiende), esa fila **se ignora** y las demás se publican igual. La web nunca
  se rompe por una fila.
- **Si la hoja no se puede leer** (quedó sin compartir, Google no responde), el
  sitio sigue mostrando lo último que se publicó con la planilla de Excel. No
  queda una página rota.
- El **banner** puede ser un nombre de archivo de `public/eventos/` (como en la
  opción B) **o el link de una imagen subida al Drive**: botón derecho sobre la
  imagen → **Compartir** → "Cualquier persona con el enlace" → *Copiar vínculo*,
  y pegás eso en la columna Banner. Tiene que ser una imagen de Google Drive;
  links de otros sitios se ignoran por seguridad.

---

## Opción B — la planilla de Excel del proyecto

Los eventos salen de una planilla de Excel que está en el proyecto:
**`data/eventos.xlsx`**. No hay que tocar código.

1. **Abrí `data/eventos.xlsx`** con Excel (o con LibreOffice / Google Sheets).
   La primera hoja, **Instrucciones**, explica lo mismo que está acá.
2. **Si el evento tiene un banner** (una imagen), copiá el archivo de imagen en la carpeta
   **`public/eventos/`**. Puede ser `.jpg`, `.jpeg`, `.png`, `.webp` o `.avif`.
   Lo ideal es una imagen apaisada, proporción 16:9 (por ejemplo 1200 × 675) y de menos
   de 300 KB.
3. **Andá a la hoja `Eventos`** y completá **una fila por evento**:

   | Columna | ¿Obligatorio? | Qué va |
   |---|---|---|
   | **Título** | Sí | El nombre del evento, como se va a ver en la web. Hasta 120 caracteres. |
   | **Descripción** | Sí | Dos o tres líneas contando de qué se trata y qué ofrecemos. Hasta 400 caracteres. |
   | **Día** | Sí | La fecha, en formato `DD/MM/AAAA` (por ejemplo `14/11/2026`). |
   | **Hora** | No | En formato `HH:MM` de 24 horas (por ejemplo `21:00`). Si la dejás vacía, la tarjeta no muestra horario. |
   | **Banner** | No | El **nombre exacto** del archivo que copiaste en `public/eventos/`, por ejemplo `recital.jpg`. Si la dejás vacía, la tarjeta muestra un fondo con los colores de la marca. |
   | **Activo** | No | `SI` publica el evento, `NO` lo deja guardado sin publicar. Vacío = `SI`. |

4. **Guardá la planilla** (Ctrl + S) y cerrala.
5. **Publicá el cambio** (ver más abajo).

### Cosas que conviene saber

- **Los eventos que ya pasaron se dejan de mostrar solos.** Igual conviene borrar las filas
  viejas cada tanto, así la planilla no crece sin control.
- **Si no hay ningún evento próximo, la sección entera desaparece** de la web, junto con el
  link "Eventos" del menú. No queda un título vacío ni un link que no lleva a nada.
- Las **dos filas de ejemplo** de la planilla tienen `Activo = NO`, así que no se publican.
  Podés dejarlas como modelo o borrarlas.
- Si falta un dato obligatorio, la fecha está mal escrita o el banner no existe en
  `public/eventos/`, **la publicación se detiene y avisa en qué fila está el problema**.
  Nada roto llega a la web.
- No cambies los nombres ni el orden de los encabezados, ni el nombre de la hoja `Eventos`:
  el sitio los lee por posición.
- En esta opción el **banner** también puede ser el link de una imagen de Google Drive,
  igual que en la opción A.

---

## Cómo se publica un cambio

> Si los eventos los cargás en la **Google Sheet** (opción A), esto **no hace falta**:
> aparecen solos en unos minutos. Publicar es necesario para cualquier otro cambio del
> sitio y para la planilla de Excel.

Hoy el repositorio **no está conectado a Vercel por Git**, así que el deploy **no** sale solo
al hacer `push`. Son dos pasos, en este orden:

```bash
git add -A
git commit -m "eventos: agrego el recital del 14/11"
git push                  # 1) guarda el cambio en el repositorio

vercel deploy --prod      # 2) publica el sitio (también sirve `vercel --prod`)
```

Si alguna vez se conecta el repo a Vercel por Git, el paso 2 pasa a ser automático con cada
`push` a la rama principal.

---

## Comandos del proyecto (para quien programa)

```bash
npm run dev                  # desarrollo en http://localhost:3000
npm run eventos              # regenera src/data/events.json desde data/eventos.xlsx
npm run eventos:plantilla    # REGENERA data/eventos.xlsx desde cero (pisa los eventos cargados)
npm run lint                 # ESLint 9 flat config
npm test                     # node --test tests/
npm run build                # corre `npm run eventos` (prebuild) y después `next build`
npm start                    # servidor de producción local
```

`npm run build` corre el paso de eventos **antes** de compilar (script `prebuild`), así que
tanto en local como en Vercel la web se arma con lo último que diga la planilla. Si la
planilla tiene un error, el build falla con un mensaje que dice la fila.

El detalle técnico (arquitectura, decisiones, convenciones) está en `CLAUDE.md` y en `PLAN.md`.
