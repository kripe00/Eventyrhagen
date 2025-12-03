# 🏰 Eventyrhagen - Digital Krysseliste

**Eventyrhagen** er en moderne, sikker og brukervennlig mobilapplikasjon utviklet for å effektivisere hverdagen i barnehager. Appen erstatter tungvinte papirlister og Excel-ark med et digitalt system som gir full oversikt i sanntid.

Løsningen har et sterkt fokus på personvern (GDPR) og skiller tydelig mellom foresatte, ansatte og administratorer for å sikre at sensitive data kun er tilgjengelig for de med riktig tilgang.

---

## 📱 Funksjonalitet og Roller

Applikasjonen er delt inn i tre hovedprofiler, skreddersydd for brukernes behov:

### 👨‍👩‍👧 For Foresatte

Foresatte får en enkel og oversiktlig app for å håndtere levering og henting av sine barn.

- **Sjekk Inn/Ut:** Lever og hent barna med ett enkelt trykk. Status oppdateres umiddelbart hos de ansatte.
- **Sanntidsstatus:** Se om barnet er registrert som "Til stede", "Hentet" eller "Fraværende".
- **Meld Fravær:** Enkelt grensesnitt for å melde ifra om sykdom eller fridager direkte i appen.
- **Personvern:** Brukeren ser kun data om sine egne barn.

### 🧑‍🏫 For Ansatte

Ansatte får et kraftig verktøy for å holde oversikt over barnegruppen og ivareta sikkerheten.

- **Digital Krysseliste:** En live-oppdatert liste som viser status på alle barn (Til stede, Ute, Hentet, Syke).
- **Nødliste:** Alltid oppdatert oversikt som kan brukes ved brannøvelser eller turer.
- **Kontaktinfo:** Rask tilgang til foresattes telefonnummer og kontaktinfo direkte fra listen ved behov.
- **Filtrering:** Mulighet for å sortere listen basert på avdeling eller status.

### 🛡️ For Administrator

Administratoren har full kontroll over brukere og systemoppsett.

- **Brukerhåndtering:** Opprett nye profiler for barn og koble dem mot foresattes e-postadresser.
- **Tilgangskontroll:** Rollebasert tilgangskontroll (RBAC) sikrer at kun autoriserte brukere får tilgang til ansatt- eller admin-funksjoner.
- **Oversikt:** Dashboard med nøkkeltall for barnehagen.

---

## 🛠️ Teknologisk Stack & Arkitektur

Prosjektet er bygget med moderne web-teknologier optimalisert for mobil, med fokus på ren kode og skalerbarhet.

- **Frontend:** [React Native](https://reactnative.dev/) med [Expo](https://expo.dev/)
- **Backend / Database:** [Google Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **State Management:** React Context API (`AuthContext`) for global autentisering.
- **Kodekvalitet:**
  - **Custom Hooks:** Logikk er abstrahert ut i egne hooks (f.eks. `useEmployeeLogic`, `useParentLogic`) for å skille logikk fra UI.
  - **Komponentbasert:** Gjenbrukbare komponenter for lister, kort og modaler.
  - **Sikkerhet:** API-nøkler håndteres via miljøvariabler.

---

## 🚀 Kom i gang

Følg disse stegene for å kjøre prosjektet lokalt på din maskin.

### 1. Forutsetninger

Du må ha [Node.js](https://nodejs.org/) og [Git](https://git-scm.com/) installert på maskinen din.

### 2. Klon prosjektet

```bash
git clone [https://github.com/kripe00/Eventyrhagen.git](https://github.com/kripe00/Eventyrhagen.git)
cd Eventyrhagen
```

### 3. Installasjon og Konfigurasjon

For å få appen til å fungere må du installere avhengigheter og sette opp koblingen mot Firebase.

1.  **Installer pakker:**

    ```bash
    npm install
    ```

2.  **Sett opp miljøvariabler (.env):**
    For at appen skal kunne koble seg til databasen, må du opprette en fil som heter `.env` i roten av prosjektmappen (samme sted som `package.json`).

    Kopier innholdet under, lim det inn i `.env`-filen, og erstatt verdiene med dine egne nøkler fra Firebase Console:

    ```env
    FIREBASE_API_KEY=din_api_key_her
    FIREBASE_AUTH_DOMAIN=eventyrhagen-xxxxx.firebaseapp.com
    FIREBASE_PROJECT_ID=eventyrhagen-xxxxx
    FIREBASE_STORAGE_BUCKET=eventyrhagen-xxxxx.firebasestorage.app
    FIREBASE_MESSAGING_SENDER_ID=123456789
    FIREBASE_APP_ID=1:123456789:web:abcdef123456
    ```

    _(Nøklene finner du under: Project Settings -> General -> Your apps)_

### 4. Start applikasjonen

Når installasjonen er ferdig og `.env` er på plass, kan du starte appen:

```bash
npm start
```

Dette vil starte Metro Bundler.

- **Fysisk mobil:** Skann QR-koden med **Expo Go**-appen (Android/iOS).
- **Emulator:** Trykk `a` for Android eller `i` for iOS i terminalen.
