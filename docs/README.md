# GrepoFusion (no-automation)

Legal-friendly paczka dla Grepolis: nowoczesne motywy (Aegis), podmiana grafik przez Asset Map, panel ustawień i dock „pomocników” UI. Brak automatyzacji — skrypt nie klika i nie wysyła akcji w Twoim imieniu.

## Najważniejsze
- **Motywy**: Classic / Remaster 2025 / Pirate / Dark.
- **Asset Map**: podmiana grafik z repo (`assets/...`). Zmieniasz RAW base w panelu ⚙.
- **Dock pomocników**: skróty do Senatu/Koszar/Portu/Akademii i podświetlenia elementów — wszystko manual.
- **Welcome + Changelog** po wejściu do gry.

## Instalacja
- Zainstaluj `dist/grepofusion.user.js` w Tampermonkey.
- Odśwież grepolis — kliknij ⚙ w prawym dolnym rogu, wybierz motyw i RAW base.

## Struktura
dist/grepofusion.user.js assets/ ships/ bireme.png bireme_pirate.png buildings/ senate.png academy.png ui/ settings.png report.png message.png
## Rozszerzanie mapy assetów
W panelu ⚙ → „Importer mapy assetów” wklej JSON:
```json
{"ships/lightship.png":"https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/ships/lightship.png"}