# Lineupbook — CS2

Prosta strona do przechowywania lineupów CS2. Aktualny pool ESL/Valve użyty na stronie: **Cache, Inferno, Mirage, Nuke, Dust II, Ancient, Anubis**.

## Podłączenie Supabase

1. Utwórz projekt na [Supabase](https://supabase.com/).
2. W panelu projektu otwórz **SQL Editor**, wybierz **New query**, wklej całą zawartość pliku `supabase.sql` i uruchom.
3. Otwórz **Project Settings → API**. Skopiuj `Project URL` oraz klucz `anon` / `publishable`.
4. W pliku `app.js` zastąp `TWOJ_SUPABASE_URL` i `TWOJ_SUPABASE_ANON_KEY` tymi wartościami.
5. Otwórz `index.html` przez lokalny serwer (np. rozszerzenie Live Server w VS Code) albo wrzuć te trzy pliki na Vercel / Netlify.

Po tym kliknięcie **Dodaj lineup** zapisze opis w tabeli `lineups`, a obraz w buckecie Storage `lineup-images`.

> Uwaga: obecne polityki SQL pozwalają każdemu odwiedzającemu dodawać zdjęcia i wpisy, co jest wygodne na start. Przed publiczną premierą warto dodać logowanie Supabase Auth i ograniczyć insert tylko do zalogowanych użytkowników.
