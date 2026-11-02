# AT Turismo y Traslados — sitio web

Sitio de una sola página para traslados y viajes desde Mar del Plata.
Está publicado en **https://at-turismo-mdp.vercel.app**.

El formulario de cotización no guarda nada: arma un mensaje y abre WhatsApp.

---

## Cómo agregar o sacar un evento de "Próximos eventos"

Los eventos de la web salen de una planilla de Excel que está en el proyecto:
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

---

## Cómo se publica un cambio

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
