# Simulacija Košarkaškog Turnira

Ovaj repozitorijum sadrži simulaciju košarkaškog turnira, uključujući grupnu fazu i eliminacione runde. Simulacija čita podatke o timovima iz JSON fajla, pokreće simulacije za svaku fazu turnira i prikazuje konačne rezultate.

## Pregled Klasa

### `Team`

Predstavlja košarkaški tim i upravlja njegovim performansama i statistikama.

-   **Konstruktor**: `constructor(name, isoCode, fibaRanking)`
    -   `name`: Ime tima.
    -   `isoCode`: ISO kod tima.
    -   `fibaRanking`: FIBA rangiranje tima.
-   **Atributi**:

    -   `name`: Ime tima.
    -   `isoCode`: ISO kod tima.
    -   `fibaRanking`: FIBA rangiranje tima.
    -   `wins`: Broj pobeda.
    -   `losses`: Broj poraza.
    -   `_points`: Interni bodovi (ne pristupa se direktno).
    -   `pointsFor`: Ukupno postignuti poeni od strane tima.
    -   `pointsAgainst`: Ukupno primljeni poeni od strane tima.
    -   `headToHeadResults`: Rezultati međusobnih mečeva sa drugim timovima.

-   **Metode**:
    -   `get points()`: Vraća ukupne bodove izračunate na osnovu pobeda i poraza.
    -   `addPoints(points)`: Dodaje bodove ukupnom broju bodova tima.
    -   `get pointsDifference()`: Vraća razliku između postignutih i primljenih poena.
    -   `addHeadToHeadResult(opponent, scoreA, scoreB)`: Dodaje rezultat međusobnog meča.

### `Group`

Upravlja grupom timova, simulira mečeve i rangira timove.

-   **Konstruktor**: `constructor(name)`

    -   `name`: Ime grupe.

-   **Atributi**:

    -   `name`: Ime grupe.
    -   `teams`: Niz instanci klase `Team` u grupi.

-   **Metode**:
    -   `addTeam(team)`: Dodaje tim u grupu.
    -   `getTeamByName(name)`: Nalazi tim po imenu.
    -   `simulateMatches()`: Simulira sve mečeve unutar grupe.
    -   `playMatch(teamA, teamB)`: Simulira meč između dva tima.
    -   `rankTeams()`: Rangira timove na osnovu bodova, razlike u bodovima i postignutih poena.
    -   `handleTiebreakers()`: Rešava izjednačenja za timove sa identičnim rangiranjem.
    -   `getRankedTeams()`: Vraća listu rangiranih timova.

### `Tournament`

Upravlja celokupnim turnirom, uključujući grupne faze i eliminacione runde.

-   **Konstruktor**: `constructor()`

    -   Inicijalizuje grupe, eliminacione mečeve i skladište rezultata.

-   **Atributi**:

    -   `groups`: Objekat koji čuva instance `Group` po imenu.
    -   `knockoutMatches`: Niz eliminacionih mečeva.
    -   `semiFinalists`: Niz timova koji su stigli do polufinala.
    -   `thirdPlaceMatch`: Meč za treće mesto.
    -   `finalists`: Niz timova koji su stigli do finala.
    -   `eliminationResults`: Objekat koji čuva rezultate za svaku eliminacionu rundu.

-   **Metode**:
    -   `addGroup(name)`: Dodaje novu grupu u turnir.
    -   `loadTeams(groupName, teams)`: Učitava timove u specificiranu grupu iz JSON podataka.
    -   `simulateGroupStage()`: Simulira mečeve grupne faze.
    -   `displayFinalRankings()`: Prikazuje konačne rangove timova u svakoj grupi.
    -   `getFinalRankings()`: Vraća sve timove rangirane nakon grupne faze.
    -   `playMatch(teamA, teamB)`: Simulira meč između dva tima.
    -   `drawQuarterFinals()`: Povlači i simulira mečeve četvrtfinala.
    -   `simulateEliminationRound(matches)`: Simulira mečeve eliminacionih rundi.
    -   `playEliminationPhase()`: Pokreće eliminacionu fazu uključujući četvrtfinala, polufinala, meč za treće mesto i finale.
    -   `areTeamsFromSameGroup(teamA, teamB)`: Proverava da li su dva tima iz iste grupe.

## Korišćenje

1. **Instalirajte Zavistnosti**: Osigurajte da imate instaliran Node.js. Nisu potrebni dodatni npm paketi za ovaj kod.

2. **Pripremite JSON Podatke**: Kreirajte `groups.json` fajl u istom direktorijumu kao `index.js`. Fajl treba da sadrži podatke o timovima u sledećem formatu:

    ```json
    {
        "A": [
            { "Team": "Tim A1", "ISOCode": "A1", "FIBARanking": 1 },
            { "Team": "Tim A2", "ISOCode": "A2", "FIBARanking": 2 },
            { "Team": "Tim A3", "ISOCode": "A3", "FIBARanking": 3 },
            { "Team": "Tim A4", "ISOCode": "A4", "FIBARanking": 4 }
        ],
        "B": [
            { "Team": "Tim B1", "ISOCode": "B1", "FIBARanking": 5 },
            { "Team": "Tim B2", "ISOCode": "B2", "FIBARanking": 6 },
            { "Team": "Tim B3", "ISOCode": "B3", "FIBARanking": 7 },
            { "Team": "Tim B4", "ISOCode": "B4", "FIBARanking": 8 }
        ],
        "C": [
            { "Team": "Tim C1", "ISOCode": "C1", "FIBARanking": 9 },
            { "Team": "Tim C2", "ISOCode": "C2", "FIBARanking": 10 },
            { "Team": "Tim C3", "ISOCode": "C3", "FIBARanking": 11 },
            { "Team": "Tim C4", "ISOCode": "C4", "FIBARanking": 12 }
        ]
    }
    ```

3. **Pokrenite Simulaciju**: Izvršite skript koristeći npm.

    ```sh
    npm start
    ```

4. **Pogledajte Rezultate**: Konzola će prikazati:
    - Rezultate mečeva grupne faze.
    - Konačne rangove timova u svakoj grupi.
    - Rezultate i rangiranje eliminacionih rundi, uključujući konačno stanje medalja.
