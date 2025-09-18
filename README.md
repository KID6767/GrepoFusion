# GrepoFusion — 1.5.0.2-alpha

GrepoFusion to pakiet wizualnych i funkcyjnych ulepszeń do Grepolis: motywy (Aegis), podmiana grafik (AssetMap), panel ustawień, oraz wbudowane moduły-asystenci (Pomocnik Budowlańca, Rekruter, Asystent Akademii).

> Wersja alpha 1.5.0.2 — legal-friendly: automatyczne akcje domyślnie wyłączone. Wszystkie akcje wykonuje użytkownik (manual/klik).

## Instalacja (szybki start)
1. W repo utwórz folder `assets/ships/` i wrzuć:
   - `bireme.png`
   - `bireme_pirate.png`
2. Zainstaluj `dist/grepofusion.user.js` w Tampermonkey (lub wklej zawartość skryptu jako nowy userscript).
3. Odśwież Grepolis.
4. Otwórz panel ustawień (ikona ⚙ w prawym dolnym rogu) i sprawdź RAW base, motywy i mapowanie assetów.

## Co zawiera paczka
- `dist/grepofusion.user.js` — główny skrypt (themes, assetmap, panel, asystenci)
- `assets/ships/bireme.png` — bio test
- `assets/ships/bireme_pirate.png` — bio pirate test
- placeholdery dla innych grafik (wyświetlają się automatycznie, dopóki nie wrzucisz prawdziwych)

## Panel ustawień
- Motyw: Classic / Remaster / Pirate / Dark
- RAW base: URL do katalogu z assetami (domyślnie GitHub)
- Import mapy: JSON z mapowaniem ścieżek (np. `{"ships/trireme.png":"https://.../trireme.png"}`)

## Asystenci
- **Pomocnik Budowlańca** — UI do ustawiania docelowych poziomów budynków per miasto. Generuje zlecenia i umożliwia ich wykonanie ręczne.
- **Rekruter** — pozwala tworzyć zlecenia rekrutacji (format `unit:count`) i wykonywać je (manual).
- **Asystent Akademii** — plan badań per miasto i manual execution.

## Dalsze prace
- Kolejne paczki assetów (statki, budynki, UI) będą wgrywane partiami.
- Dalsze dopracowanie wykonywania zleceń oraz integracji z oryginalnymi modami (wcielenie funkcjonalności).

© KID6767 & ChatGPT