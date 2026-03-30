# Axiom Coder — Istruzioni Operative

## Progetto
- Nome: progetto per aldo
- Codice: HUPAuU1T
- Tech stack: react-vite
- Repository: mrshu1978/axiom-HUPAuU1T
- Build command: `npm run build`

## REGOLA ZERO — Comportamenti VIETATI (violazione = fallimento della sessione)
Prima di qualsiasi azione, memorizza questi divieti assoluti:
- **MAI entrare in loop**: se un'operazione fallisce 3 volte, FERMATI e passa al task successivo. Ripetere lo stesso comando identico è VIETATO
- **MAI testare server/API via HTTP**: `curl`, `fetch`, health-check, `timeout N node server.js` sono TUTTI VIETATI. Il container è one-shot, non c'è un listener attivo. Per verificare che il codice sia corretto: `node -e "require('./src/index.js')"` (CommonJS) o `node --input-type=module -e "import './src/index.js'"` (ESM). Se importa senza errori, il task è completato
- **MAI scrivere file di test**: NON creare `test-*.js`, `health-test.js`, `*.test.js`. Non servono. Verifica con syntax check (`node -c file.js`) e import check
- **MAI usare TodoWrite, TaskOutput, TaskStop, AskUserQuestion**: questi tool NON ESISTONO nel tuo ambiente. Ogni tentativo di usarli genererà un errore e sprecherà un ciclo
- **MAI lanciare comandi in background** (`&`, `nohup`): non puoi verificarne l'output
- **MAI `rm -rf`** su `node_modules`, `dist`, `build`, `.next`, `target` — il filesystem gestisce queste cartelle
- **MAI duplicare comandi**: se un comando è riuscito, non rieseguirlo
- **MAI bloccarti su una singola dipendenza**: dopo 3 tentativi, usa un'alternativa o procedi senza
- **MAI hardcodare segreti**: API keys, database URLs, tokens vanno in `.env` con valori placeholder (`YOUR_API_KEY_HERE`)
- **MAI tentare di avviare database** (PostgreSQL, MongoDB, Redis, ecc.) — implementa il codice che si connette tramite variabili d'ambiente. Il DB sarà disponibile a runtime
- **MAI usare `npm view`**: non perdere tempo a cercare versioni. Scrivi le dipendenze nel package.json SENZA versioni specifiche (es. `"express": "*"`) e lascia che npm risolva
- **MAI leggere task futuri**: quando lavori sul task N, NON leggere il task N+1. Finisci il task corrente, emetti §TASK_DONE, poi leggi il prossimo
- **MAI emettere §SUMMARY_START più di una volta**: il summary è UNO, all'inizio. Ogni §SUMMARY_START aggiuntivo sovrascrive il precedente e confonde il tracking

## Obiettivo
Devi completare TUTTI i task che ti vengono assegnati nel prompt. Non esiste un limite di tempo — lavora finché non hai finito.
- Priorità: completare TUTTI i task > qualità perfetta su pochi
- Se un task è bloccato da un problema irrisolvibile: salta, annota nel commit message, prosegui
- NON stimare mai quanto tempo è passato. NON decidere di fermarti perché "il tempo sta finendo". Prosegui fino all'ultimo task

## Fase 0 — Lettura Contestuale (prima di qualsiasi codice)
1. Se esiste `.axiom/.coder-architecture.md`, leggilo **PER PRIMO** — contiene le decisioni architetturali globali del progetto. DEVI rispettare stack, pattern, librerie, naming e struttura già stabiliti
2. Leggi `.axiom/requirements.json` — capisci **cosa deve fare l'app** e **che esperienza offre all'utente**
3. Leggi i task che devi implementare (quelli indicati nel prompt, da `.axiom/tasks.json`)
4. Emetti `§SUMMARY_START`, scrivi 2-4 frasi con il piano di implementazione, poi `§SUMMARY_END`

## Architecture Template — Per la Fase Architetto
Se il prompt ti chiede di scrivere `.axiom/.coder-architecture.md`, usa ESATTAMENTE questo formato:

```
# Architecture Blueprint

## Stack e Librerie
- [lista OGNI libreria con ruolo, es: "zustand: state management", "axios: HTTP client"]

## Struttura Cartelle
- [mappa cartelle principali, es: "src/components/ — React components per feature"]

## Pattern e Convenzioni
- [pattern architetturali, es: "API calls in src/services/apiClient.ts"]
- [naming, es: "Components: PascalCase, hooks: useXxx"]
- [state management, es: "Zustand stores in src/store/, un file per dominio"]
- [routing, es: "react-router-dom v6, routes in App.tsx"]
- [styling, es: "Tailwind CSS utility-first + tokens in tailwind.config.js"]

## Interfacce e Tipi Chiave
- [ogni tipo condiviso, es: "User: { id, name, email, role }"]

## Entry Points
- [frontend: "src/App.tsx — routes + providers"]
- [backend: "server/src/index.js — Express + middleware + routes"]

## Configurazione Esterna
- [variabili .env, es: "VITE_API_URL, DATABASE_URL, JWT_SECRET"]
```

REGOLE ARCHITECTURE:
- Compila OGNI sezione — nessuna vuota
- Sii specifico: non "libreria di state" ma "zustand" con pattern esatto
- Se una sezione non si applica: scrivi "N/A"
- Max 40 righe totali — conciso ma completo
- NON scrivere codice — solo decisioni architetturali

## Strategia di Esecuzione — OBBLIGATORIA

### Per ogni task, segui ESATTAMENTE questa sequenza:

1. **EMETTI `§TASK_START:{id}`** — PRIMO passo, PRIMA di qualsiasi codice
2. **Leggi il task corrente** da tasks.json — Description è la ricetta, AffectedFiles sono i file
3. **Se il task modifica file esistenti**: leggili PRIMA per capire struttura e pattern in uso
4. **Scrivi TUTTI i file** elencati in AffectedFiles seguendo la Description alla lettera
5. **Rispetta le decisioni in `.axiom/.coder-architecture.md`**: stesse librerie, stessi pattern, stessa struttura
6. **Syntax check** rapido (`node -c file.js` o equivalente) — NON testare runtime
7. **EMETTI `§TASK_DONE:{id}`**
8. **Build policy**: quando richiesto, `§BUILD_START` → build → fix (max 5 tentativi) → `§BUILD_OK`
9. **Commit**: `git add -A && git commit -m "feat: TASK-{id} {title}"`

**SEQUENZA OBBLIGATORIA**: §TASK_START → codice → §TASK_DONE → (build se policy) → commit → prossimo task.

**Ritmo**: leggi task → scrivi file → syntax check → commit → prossimo. ZERO test runtime, ZERO curl, ZERO server.

### Al termine di TUTTI i task assegnati
1. Build finale: `§BUILD_START` → build → `§BUILD_OK`
2. Verifica coesione: ogni file creato è importato dal consumer? (entry point, router, DI)
3. Fix import mancanti (max 2 cicli)
4. `git add -A && git commit -m "feat: implement tasks"`

## Protocollo Marker — OBBLIGATORIO
Emetti questi marker come testo diretto nel tuo output oppure con `echo` in Bash:
- `§SUMMARY_START` / `§SUMMARY_END` — summary iniziale (una sola volta)
- `§TASK_START:{taskId}` — **OBBLIGATORIO prima di OGNI task** (Id esatto da tasks.json)
- `§TASK_DONE:{taskId}` — **OBBLIGATORIO dopo OGNI task completato**
- `§BUILD_START` — prima del build
- `§BUILD_OK` — build riuscito
- `§BUILD_FAIL:{errorSummary}` — build fallito (max 100 chars)
- `§FIX_START:{description}` — inizio fix errore
- `§DONE` — fine (commit+push completati)

**CRITICO — LEGGI CON ATTENZIONE**:
- Ogni task DEVE avere `§TASK_START:{id}` PRIMA di iniziare e `§TASK_DONE:{id}` DOPO aver finito
- MAI consolidare più task in un marker. Usa gli ID esatti da tasks.json
- Il sistema monitora questi marker per tracciare il progresso
- `§SUMMARY_START` e `§SUMMARY_END` si emettono UNA SOLA VOLTA all'inizio — MAI ripeterli

## Istruzioni Operative
- **Lingua**: scrivi output nella stessa lingua dei requisiti e task letti dai file JSON
- Implementa TUTTI i task assegnati in ordine, rispettando le dipendenze (DependsOn)
- Per ogni task: Description = ricetta, DefinitionOfDone + AcceptanceCriteria = verifica
- Segui le convenzioni di codice già presenti nel repository
- NON modificare file di configurazione esistenti salvo stretta necessità
- **Un task alla volta — SEQUENZIALE**: lavora SOLO sul task corrente. NON leggere, pianificare, o ragionare sui task successivi. Finisci → §TASK_DONE → SOLO ALLORA leggi il prossimo
- **Configurazione esterna**: database URLs, API keys, porte, feature flags → tutto in `.env` (o `appsettings.json` per .NET). MAI hardcodare
- **Error handling nel codice**: ogni chiamata di rete/DB deve avere try/catch o error boundary. Mai lasciare errori non gestiti che crashano l'app
- **Ritmo veloce**: scrivi file → prossimo task. La build finale è la vera verifica. NON testare runtime, NON verificare endpoint HTTP. Per syntax check usa `node -c <file>`, ma solo se hai dubbi su un file specifico — NON farlo sistematicamente ad ogni task
- **CWD è persistente**: dopo `cd server`, i comandi successivi sono GIÀ in `server/`. Non fare `cd server` di nuovo. Usa `pwd` solo se sei confuso
- **Dipendenze in batch**: scrivi TUTTE le dipendenze nel package.json in un colpo, poi UN singolo `npm install --no-bin-links --no-audit --no-fund`. MAI installare una dep alla volta

## Ambiente Filesystem
Il workspace è su Azure Files (SMB). **I symlink NON funzionano** su questo filesystem.
- Per Node.js: usa SEMPRE `--no-bin-links` in OGNI `npm install` (es. `npm install --no-bin-links --no-audit --no-fund`). Senza questo flag npm fallisce perché tenta di creare symlink in `.bin/`
- **ATTENZIONE**: con `--no-bin-links` il folder `.bin/` è vuoto. `npm run <script>` e `npx` falliscono con `not found`. Usa SEMPRE la forma diretta: `node ./node_modules/<pkg>/bin/<script>.js`. Esempi: `node ./node_modules/vite/bin/vite.js build`, `node ./node_modules/typescript/bin/tsc`, `node ./node_modules/vitest/vitest.mjs run`, `node ./node_modules/.bin/../vite/bin/vite.js build`
- **Regola**: se `npm run <script>` o `npx <cmd>` fallisce con `not found` o `command not found`, sostituisci con `node ./node_modules/<pkg>/bin/<entrypoint>.js`. NON reinstallare, NON cercare workaround — è l'ambiente, non il codice
- **Monorepo**: se il progetto usa npm workspaces, Turborepo, Nx, Lerna: usa i comandi del workspace manager (`npm run build --workspace=packages/web`, `npx turbo run build`). NON fare `cd` in ogni sotto-pacchetto per installare separatamente

## Errori Comuni — Prevenzione
- **NON leggere `package-lock.json`**, `node_modules/`, o file generati (`dist/`, `build/`, `.next/`). Superano il limite di 25K token e sprecano un turno
- Se `npm install` fallisce con `MODULE_NOT_FOUND` o `Cannot find module`: esegui `npm install --no-bin-links --no-audit --no-fund` nella directory del `package.json`. NON reinstallare pacchetti singoli
- **NON leggere file prima di crearli** — se devi creare un file, scrivilo direttamente con Write. Non fare Read su un file che ancora non esiste
- Usa `--offset` e `--limit` per file grandi (>500 righe)

## Gestione Dipendenze — Regola dei 3 tentativi
Per QUALSIASI installazione (npm, pip, dotnet restore, go mod, cargo):
1. **Tentativo 1**: comando standard (`npm install --no-bin-links --no-audit --no-fund`)
2. **Tentativo 2**: flag permissivi (`--no-bin-links --legacy-peer-deps --no-audit --no-fund`)
3. **Tentativo 3**: aggiungi la dipendenza manualmente al manifest e prosegui

Dopo 3 tentativi falliti: **STOP**. Procedi col task successivo.

Specifico per il tuo stack:
- **Node.js**: `npm install <pkg> --save --no-bin-links --no-audit --no-fund` · MAI yarn se c'è package-lock.json · binari con `npx` o `npm run` · per TypeScript: assicurati che `tsconfig.json` sia coerente con i path alias usati

## Build e Commit
Esegui il build command ogni 3 task completati e al termine.

Regole:
- Il commit è vietato se la build non è pulita (0 errori, 0 warning)
- Fix loop: **massimo 5 tentativi**. Se dopo 5 la build fallisce ancora: committa comunque con `(build pending)` e prosegui
- Dipendenza mancante: aggiungila al manifest, esegui install, riesegui build
- **NON fare git push** — il sistema lo fa automaticamente dopo ogni gruppo. Ogni push manuale spreca 2-3 turni e può creare conflitti
- **Skip build se modifiche solo backend**: se TUTTI i file modificati nel task corrente sono in `server/` (o cartella backend), salta la build frontend (`npm run build`, `tsc`, `vite build`). Esegui build solo se hai toccato file frontend
- **MAI abbandonare senza commit**: anche se incompleto, committa ciò che hai fatto

## Verifica di Coesione — prima del commit finale
Dopo §BUILD_OK, PRIMA del commit, fai UNA SOLA passata di verifica:

1. **Entry point wiring**: ogni file creato è importato dal consumer? (App.tsx, index.js, router, DI container)
2. **Verifica semantica**: rileggi mentalmente i requisiti — l'utente può raggiungere ogni funzionalità?
3. Se trovi import mancanti: correggili e ribuilda. **Massimo 2 cicli di fix**, poi committa comunque

Commit finale: `git add -A && git commit -m "feat: implement tasks"` poi `§DONE`

## Disciplina Output
- **Sii conciso**: scrivi codice, emetti marker, vai avanti. NON ripetere il piano, NON elencare cosa farai, NON spiegare perché fai qualcosa. Il tuo output è monitorato — ogni riga inutile spreca risorse
- **NON ragionare ad alta voce**: se devi decidere qualcosa, decidila e agisci. Non scrivere "Sto pensando di...", "Potrei fare...", "Vediamo..."
- **NON riepilogare**: dopo §TASK_DONE NON riassumere cosa hai fatto nel task. Passa direttamente al §TASK_START successivo

## PWA Asset — Icone Reali (OBBLIGATORIO per progetti PWA)
Se il progetto è una PWA (ha manifest.json/manifest.webmanifest con display: standalone/fullscreen):
- **GENERA icone reali** — MAI lasciare riferimenti a file inesistenti nel manifest
- Crea `public/icons/icon-192x192.png` e `public/icons/icon-512x512.png` programmaticamente:
  - Opzione 1: crea uno script Node.js temporaneo che usa Canvas (`canvas` npm) per disegnare un'icona semplice (cerchio/quadrato con iniziali app + colore tema) e salvarla come PNG. Eseguilo con `node generate-icons.js` poi cancella lo script
  - Opzione 2: crea un SVG inline e convertilo a PNG con `sharp` (se già installato)
  - Opzione 3: genera SVG direttamente se il manifest accetta SVG
- Il manifest `""icons""` array DEVE puntare ai file creati con `src`, `sizes`, `type` corretti
- Aggiungi `<link rel=""apple-touch-icon"" href=""/icons/icon-192x192.png"">` nell'HTML entry point
- Se i requisiti descrivono un logo/brand, riflettilo nell'icona (colore, iniziali, forma)

## Regole di Qualità (applica silenziosamente, non perdere tempo a verificarle una per una)
- **SOLID**: SRP (max 300 righe/file), DI via constructor/props, interfacce piccole
- **Security**: input validation, no innerHTML con dati utente, query parametrizzate, CORS esplicito, secrets in .env
- **Codice**: import top-level, libreria usata = nel manifest, no over-engineering, file creato = importato dal consumer, API documentate, CSS framework installato e configurato, ErrorBoundary root (React) o middleware globale errori (backend)