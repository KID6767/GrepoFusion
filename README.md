# GrepoFusion — Pirate/Remaster/Dark Skin + Tools

**GrepoFusion** to zintegrowany pakiet ulepszeń dla Grepolis. Łączy przyjemny, nowoczesny wygląd (Aegis: Classic / Remaster 2025 / Pirate / Dark) z praktycznymi funkcjami: **Asset Map** (podmiana grafik z repozytorium), **AutoBuild (Senat)**, **panel ustawień**, **ekran powitalny** i **changelog**.

## Najważniejsze funkcje

- **Aegis Theme Switcher** – Classic / Remaster 2025 / Pirate / Dark.
- **Asset Map** – centralna mapa grafik. Wystarczy podmienić pliki w `assets/…`, skrypt sam je załaduje.
- **AutoBuild (Senat)** – kolejkuje budowy wg priorytetów (w tle), z przełącznikiem w panelu.
- **Panel ⚙** – motyw, RAW base (adres do grafik), przełącznik AutoBuild, reset ustawień.
- **Welcome** – pierwsza konfiguracja (motyw + RAW base).
- **Changelog** – zwięzły pop-up po starcie.

## Instalacja (Tampermonkey)

1. Wejdź na:  
   `https://github.com/KID6767/GrepoFusion/raw/refs/heads/main/dist/grepofusion.user.js`
2. Tampermonkey zaproponuje instalację. Zatwierdź.
3. Odśwież Grepolis. W prawym-dolnym rogu zobaczysz ikonę ⚙ (panel GrepoFusion).

## Struktura repo

dist/
grepofusion.user.js # gotowy skrypt
assets/
ships/
bireme.png # remasterowana birema
bireme_pirate.png # birema – wariant piracki
buildings/
senate.png # przykładowa podmiana budynku (opcjonalnie)
ui/
settings.png # ikony UI (opcjonalnie)
README.md
CHANGELOG.md

> **Uwaga:** możesz trzymać tylko te grafiki, które realnie chcesz podmieniać. Braki nie psują działania – Asset Map podmieni jedynie te ścieżki, które znajdzie.

## Podmiana grafik (Asset Map)

- Domyślny RAW base:  
  `https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets`
- Zmień go w panelu ⚙ → wpisz własny URL (np. fork lub CDN).
- Dodatkowe mapowania możesz wstrzyknąć z konsoli:  
  `GF.addAssetMap({ "ships/lightship.png": "https://…/mój_lightship.png" })`

## AutoBuild (Senat)

- Działa w tle (po załadowaniu gry).  
- Przełącznik: panel ⚙ → *AutoBuild*.  
- Priorytety budynków definiuje tablica `instructions` w skrypcie.

## Zgłoszenia / wsparcie

- PRO tip: w razie problemów otwórz konsolę dev (`F12` → Console) i wpisz `GF.debug()`.



## Jak przetestować biremy
1) W repo dodaj pliki:
assets/ships/bireme.png assets/ships/bireme_pirate.png
Skopiuj kod

2) Zainstaluj `dist/grepofusion.user.js` w Tampermonkey.
3) Odśwież Grepolis – w porcie/listach statków zobaczysz podmienione biremy.
4) Reszta statków/budynków/UI ma placeholdery (GF w złocie/emeraldzie), więc od razu widać, że mechanizm działa.

## Panel ⚙
- Zmiana motywu (Aegis).
- RAW base (skąd brać grafiki) – domyślnie GitHub `assets`.
- Importer mapy (JSON linia) do szybkiego podmieniania konkretnych ścieżek.

## Debug (konsola)
- `GF.setTheme('pirate')`
- `GF.setRawBase('https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets')`
- `GF.addAssetMap({"ships/lightship.png":"https://…/ls.png"})`


---

© 2025 KID6767 & ChatGPT. Skórki i kod wcielają funkcjonalnie popularne narzędzia – bez cudzego brandingu, w zgodzie z zasadami forum.
