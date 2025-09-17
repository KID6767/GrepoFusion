# GrepoFusion 1.5.0-beta — Pirate Edition

**GrepoFusion** to uniwersalny pakiet modyfikacji dla Grepolis:
- 🎨 Motywy (Classic / Emerald / Pirate)
- ⚙️ Panel ustawień (ikona ⚙ w prawym dolnym rogu)
- 🧹 Clean Mode (usuwa ślady innych dodatków)
- 📜 Changelog przy każdym odświeżeniu
- 🖼️ Wybór pakietu grafik (Classic / Pirate / Remaster)
- 🚢 Wstępne podmiany ikon (statki/UI)
- 🧪 GrepoFusion Lab (zapas na eksperymentalne funkcje)

## Instalacja (Tampermonkey)
1. Wejdź na adres RAW skryptu:
https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
2. Tampermonkey powinien zaproponować instalację → **Install**.
3. Odśwież Grepolis.

## Struktura repo
dist/ # główny userscript (grepofusion.user.js)
assets/
classic/ # oryginalny styl
pirate/ # piracki remaster (Black Pearl vibe)
remaster2025/ # nowa, „czystsza” wersja 2025
docs/
README.md
CHANGELOG.md

## Ustawienia (panel)
- **Motyw UI** – wybór schematu kolorów
- **Pakiet grafik** – Classic / Pirate / Remaster
- **Asset Base** – skąd ładować grafiki (np. GitHub RAW)
- **Clean Mode** – ukrywa UI innych dodatków
- **Changelog Always** – pokazuj changelog przy każdym odświeżeniu

## Podmiany grafik
W 1.5.0-beta skrypt wstrzykuje bezpieczne CSS pod:
- statki: lightship, bireme, trireme, colony, fire (Black Pearl/Titanic),
- UI: report/message/settings.

> Jeśli DOM na Twoim świecie różni się – w 1.5.1 dorobię konkretne selektory do miejsc, które wskażesz na screenach.

## Zgłaszanie błędów
- Napisz, co klikałeś i co się stało.
- Dorzuć screena z konsoli (F12 → Console).
- Podaj świat i przeglądarkę.

Made with ❤️ by **KID6767 & ChatGPT**
