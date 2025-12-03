# 🏰 Eventyrhagen - Digital Krysseliste

**Eventyrhagen** er en moderne og sikker mobilapplikasjon utviklet for å erstatte den gamle Excel-baserte krysselisten i barnehager. Appen fokuserer på brukervennlighet, sikkerhet og GDPR-samsvar.

Løsningen skiller tydelig mellom foresatte og ansatte for å sikre at sensitive data kun er tilgjengelig for de med riktig tilgang.

## 📱 Funksjonalitet

### 👨‍👩‍👧 For Foresatte
- **Enkel oversikt:** Se status på egne barn (Til stede / Hentet).
- **Sjekk inn/ut:** Lever og hent barna med ett trykk.
- **Meld fravær:** Enkelt grensesnitt for å melde sykdom eller fri.
- **Personvern:** Ser kun informasjon om sine egne barn.

### 🧑‍🏫 For Ansatte
- **Totaloversikt:** Se hvor mange barn som er til stede, ute eller syke.
- **Kontaktinfo:** Rask tilgang til foresattes telefonnummer ved behov.
- **Nødliste:** Alltid oppdatert liste over barna.

### 🛡️ For Administrator
- **Brukertilgang:** Opprett barn og koble dem til foresattes e-postadresser.
- **Sikkerhet:** Rollebasert tilgangskontroll (RBAC).

---

## 🛠️ Teknologisk Stack & Oppdateringer

Prosjektet er bygget med moderne web-teknologier optimalisert for mobil.

- **Frontend:** [React Native](https://reactnative.dev/) med [Expo](https://expo.dev/)
- **Backend:** [Google Firebase](https://firebase.google.com/)
- **State Management:** React Context API (`Authcontext`) for global håndtering av innlogging.
- **Sikkerhet:** API-nøkler er flyttet til miljøvariabler (`.env`) for å unngå sensitiv info i koden.
- **Struktur:** Mappestruktur og filnavn er standardisert til små bokstaver (f.eks. `authcontext.js`) for å unngå problemer med Git.

---

## 🚀 Kom i gang

Følg disse stegene for å kjøre prosjektet lokalt på din maskin.

### 1. Forutsetninger
Du må ha [Node.js](https://nodejs.org/) installert på maskinen din.

### 2. Klon prosjektet

```bash
git clone [https://github.com/kripe00/Eventyrhagen.git](https://github.com/kripe00/Eventyrhagen.git)
cd Eventyrhagen

## 3. Installer avhengigheter
npm install


## 4. 🔑 VIKTIG: Oppsett av Miljøvariabler (.env)
For at appen skal kunne koble seg til Firebase, må du opprette en lokal konfigurasjonsfil. Denne filen inneholder API-nøklene og skal ikke lastes opp til Git.

Lag en ny fil i roten av prosjektmappen (samme sted som package.json) og kall den .env.

Kopier innholdet under og lim det inn i filen:

FIREBASE_API_KEY=din_api_key_her
FIREBASE_AUTH_DOMAIN=eventyrhagen-xxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=eventyrhagen-xxxxx
FIREBASE_STORAGE_BUCKET=eventyrhagen-xxxxx.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456


Hent nøklene: Gå til Firebase Console -> Project Settings -> General -> "Your apps".

Kopier de riktige verdiene derfra og erstatt "dummy-teksten" i din .env-fil.

Lagre filen.



## 5. Start applikasjonen

npm start

Dette vil starte Metro Bundler. Skann QR-koden med Expo Go-appen på mobilen din, eller kjør i en emulator.