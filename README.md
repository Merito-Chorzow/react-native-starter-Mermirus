# Field Notes (React Native)

Aplikacja mobilna służąca do tworzenia notatek terenowych, zbudowana w technologii React Native (Expo).

## Wymagania projektowe (Definition of Done)

- **3 widoki:** Lista wpisów (HomeScreen), Szczegóły (DetailsScreen) oraz Formularz (AddNoteScreen). Pomiędzy ekranami działa płynna nawigacja (React Navigation).
- **Funkcja Natywna (GPS):** Wykorzystano paczkę `expo-location`. W formularzu dodawania notatki użytkownik może pobrać swoje dokładne współrzędne GPS za pomocą jednego kliknięcia. Aplikacja radzi sobie z brakiem uprawnień (okienko Alert).
- **API:** Wykorzystano publiczne API (JSONPlaceholder). Na starcie aplikacja wykonuje `GET`, aby pobrać przykładowe notatki. Formularz wykorzystuje `POST`, by zasymulować wysłanie notatki na serwer. Obsłużono stan ładowania i puste stany.
- **Dostępność i UX:** Wszystkie interaktywne elementy (przyciski, karty, pola tekstowe) mają wysokość minimum `48px` (zgodnie z wytycznymi dotyczącymi celów dotyku) oraz posiadają podstawowe etykiety (accessibilityLabel).
- **Stan:** Prosty stan zarządzany lokalnie za pomocą `useContext` i `useState`.

## Jak testować lokalnie

1. Zainstaluj aplikację `Expo Go` na swoim telefonie (Android/iOS).
2. W terminalu wpisz polecenie `npx expo start`.
3. Zeskanuj kod QR aparatem w telefonie lub z poziomu aplikacji Expo Go.
4. Kliknij przycisk `+`, aby wejść do formularza. Zezwól na lokalizację i przetestuj przycisk pobierania współrzędnych.
