const fs = require('fs');

class Team {
    constructor(name, isoCode, fibaRanking) {
        this.name = name;
        this.isoCode = isoCode;
        this.fibaRanking = fibaRanking;
        this.wins = 0;
        this.losses = 0;
        this._points = 0; 
        this.pointsFor = 0;
        this.pointsAgainst = 0;
        this.headToHeadResults = {}; // Čuva rezultate međusobnih mečeva
    }

    get points() {
        return this._points;
    }

    addPoints(points) {
        this._points += points;
    }
    get pointsDifference() {
        return this.pointsFor - this.pointsAgainst;
    }

    get points() {
        return this.wins * 2 + this.losses;
    }

    addHeadToHeadResult(opponent, scoreA, scoreB) {
        this.headToHeadResults[opponent.name] = { scoreA, scoreB };
    }
}

class Group {
    constructor(name) {
        this.name = name;
        this.teams = [];
    }

    addTeam(team) {
        this.teams.push(team);
    }

    getTeamByName(name) {
        return this.teams.find(team => team.name === name);
    }

    simulateMatches() {
        const firstMach = this.teams.slice(0,2);
        const secondMatch = this.teams.slice(2,4);

        // Simuliraj mečeve između svake pare timova
        this.playMatch(firstMach[0],firstMach[1])
        this.playMatch(secondMatch[0],secondMatch[1])
        // Rangiraj timove unutar grupe
        this.rankTeams();
    }

    playMatch(teamA, teamB) {
        const scoreA = Math.floor(Math.random() * 100) + 60;
        const scoreB = Math.floor(Math.random() * 100) + 60;
    
        if (scoreA > scoreB) {
            teamA.wins++;
            teamB.losses++;
            teamA.addPoints(2); // Pobednički tim dobija 2 boda
            teamA.pointsFor += scoreA;
            teamA.pointsAgainst += scoreB;
            teamB.pointsFor += scoreB;
            teamB.pointsAgainst += scoreA;
            teamA.addHeadToHeadResult(teamB, scoreA, scoreB);
            teamB.addHeadToHeadResult(teamA, scoreB, scoreA);
        } else if (scoreA < scoreB) {
            teamB.wins++;
            teamA.losses++;
            teamB.addPoints(2); 
            teamA.pointsFor += scoreA;
            teamA.pointsAgainst += scoreB;
            teamB.pointsFor += scoreB;
            teamB.pointsAgainst += scoreA;
            teamA.addHeadToHeadResult(teamB, scoreA, scoreB);
            teamB.addHeadToHeadResult(teamA, scoreB, scoreA);
        } else {
            teamA.pointsFor += scoreA;
            teamA.pointsAgainst += scoreB;
            teamB.pointsFor += scoreB;
            teamB.pointsAgainst += scoreA;
            teamA.addHeadToHeadResult(teamB, scoreA, scoreB);
            teamB.addHeadToHeadResult(teamA, scoreB, scoreA);
        }
    
        console.log(`   ${teamA.name} - ${teamB.name} (${scoreA}:${scoreB})`);
    }
    

    rankTeams() {
        // Sortiraj timove na osnovu bodova, zatim razlike u bodovima, zatim postignutih bodova
        this.teams.sort((a, b) => {
            if (a.points !== b.points) return b.points - a.points;
            if (a.pointsDifference !== b.pointsDifference) return b.pointsDifference - a.pointsDifference;
            return b.pointsFor - a.pointsFor;
        });
        
        // Odredi kriterijume za rešavanje izjednačenja za izjednačene timove
        this.handleTiebreakers();
    }

    handleTiebreakers() {
        const teams = this.teams;
        
        // Sortiraj timove na osnovu osnovnih kriterijuma
        teams.sort((a, b) => {
            if (a.points !== b.points) return b.points - a.points;
            if (a.pointsDifference !== b.pointsDifference) return b.pointsDifference - a.pointsDifference;
            return b.pointsFor - a.pointsFor;
        });
        
        // Grupisanje timova sa identičnim rangiranjem
        const rankedTeams = teams.reduce((acc, team) => {
            const key = `${team.points}-${team.pointsDifference}-${team.pointsFor}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(team);
            return acc;
        }, {});
    
        // Rešavanje izjednačenja
        Object.keys(rankedTeams).forEach(key => {
            if (rankedTeams[key].length > 1) {
                // Sortiraj timove unutar svake grupe izjednačenja
                rankedTeams[key].sort((a, b) => {
                    // Međusobno
                    const resultA = a.headToHeadResults[b.name];
                    const resultB = b.headToHeadResults[a.name];
                    if (resultA && resultB) {
                        if (resultA.scoreA > resultA.scoreB) return -1;
                        if (resultB.scoreA > resultB.scoreB) return 1;
                    }
                    
                    // Razlika u bodovima u međusobnim mečevima
                    const diffA = (resultA ? resultA.scoreA - resultA.scoreB : 0);
                    const diffB = (resultB ? resultB.scoreA - resultB.scoreB : 0);
                    if (diffA !== diffB) return diffB - diffA;
                    
                    // Postignuti bodovi u međusobnim mečevima
                    const pointsA = (resultA ? resultA.scoreA : 0) + (resultB ? resultB.scoreB : 0);
                    const pointsB = (resultB ? resultB.scoreA : 0) + (resultA ? resultA.scoreB : 0);
                    if (pointsA !== pointsB) return pointsB - pointsA;
                    
                    // Razlika u bodovima u svim mečevima
                    if (a.pointsDifference !== b.pointsDifference) return b.pointsDifference - a.pointsDifference;
                    
                    // Postignuti bodovi u svim mečevima
                    return b.pointsFor - a.pointsFor;
                });
            }
        });
       
        // Ujednači niz timova sa rešenim izjednačenjima
        this.teams = Object.values(rankedTeams).flat();
    }
    

    getRankedTeams() {
        return this.teams;
    }
}

class Tournament {
    constructor() {
        this.groups = {};  
        this.knockoutMatches = [];
        this.semiFinalists = [];
        this.thirdPlaceMatch = null;
        this.finalists = [];
        this.eliminationResults = {}; //Sačuvani rezultati za svaki krug
    }

    addGroup(name) {
        // Ime grupe: A,B,C,
        this.groups[name] = new Group(name);
    
    }

    // Ime grupe:A,B,C , timovi = A,B,C niz[]
    loadTeams(groupName, teams) {
        teams.forEach(teamData => {
            // Formiraj tim, inicijalizacija Team klase
            const team = new Team(teamData.Team, teamData.ISOCode, teamData.FIBARanking);
            // Pozovi metodu addTeam() instance klase Group 
            this.groups[groupName].addTeam(team);
           // console.log('Tournament Class Groups',this.groups)
        });
    }

    simulateGroupStage() {
       
        for (const groupName in this.groups) {
        
            console.log(`Grupna faza - ${groupName}:`);
  
            this.groups[groupName].simulateMatches();  // Poziv metodu Group.simulateMatches()
            console.log('');
        }
    }

    simulateMatches(matches) {
        return matches.map(match => {
            const scoreA = Math.floor(Math.random() * 100) + 60;
            const scoreB = Math.floor(Math.random() * 100) + 60;
    
            const result = {
                teamA: match.teamA,
                teamB: match.teamB,
                scoreA: scoreA,
                scoreB: scoreB
            };
    
            if (scoreA > scoreB) {
                match.teamA.wins++;
                match.teamB.losses++;
            } else {
                match.teamB.wins++;
                match.teamA.losses++;
            }
    
            match.teamA.pointsFor += scoreA;
            match.teamA.pointsAgainst += scoreB;
            match.teamB.pointsFor += scoreB;
            match.teamB.pointsAgainst += scoreA;
         
            console.log(`   ${match.teamA.name} - ${match.teamB.name} (${scoreA}:${scoreB})`);
            return result;
        });
    }
    
    // Prikaz plasamana u grupama
    displayFinalRankings() {
        console.log('Konačan plasman u grupama:');
        for (const groupName in this.groups) {
            const rankedTeams = this.groups[groupName].getRankedTeams();

        
            console.log(`Grupa ${groupName}:`);
            console.log(`   (Ime - pobede/porazi/bodovi/postignuti koševi/primljeni koševi/koš razlika):`);
            rankedTeams.forEach((team, index) => {
                console.log(`    ${index + 1}. ${team.name} ${team.wins}/ ${team.losses}/ ${team.points}/ ${team.pointsFor}/ ${team.pointsAgainst}/ ${team.pointsDifference}`);
            });
            console.log('');
        }
    }
    
    // Rankovanje timova po podovima
    getFinalRankings() {
        const allTeams = [];

        // Prikupi prvoplasirane, drugoplasirane i trećeplasirane timove iz svake grupe
        ['A', 'B', 'C'].forEach(groupName => {
            const group = this.groups[groupName];
            const rankedTeams = group.getRankedTeams();
            
            // Dodaj prvoplasiranog, drugoplasiranog i trećeplasiranog u sveTimove
            allTeams.push(
                { ...rankedTeams[0], group: groupName, position: '1' },
                { ...rankedTeams[1], group: groupName, position: '2' },
                { ...rankedTeams[2], group: groupName, position: '3' }
            );
        });

        // Sortiraj sve timove po pozicijama (1 do 9) koristeći bodove, koš razliku i postignute koševe
        allTeams.sort((a, b) => {
            // Ako su pozicije iste, koristi bodove, koš razliku i postignute koševe
            if (a.position !== b.position) {
                return a.position - b.position;
            }
            if (a.points !== b.points) return b.points - a.points;
            if (a.pointsDifference !== b.pointsDifference) return b.pointsDifference - a.pointsDifference;
            return b.pointsFor - a.pointsFor;
        });

        return allTeams;
    }
   
    playMatch(teamA, teamB) {
        const scoreA = Math.floor(Math.random() * 100) + 60;
        const scoreB = Math.floor(Math.random() * 100) + 60;
    
        if (scoreA > scoreB) {
            teamA.wins++;
            teamB.losses++;
        } else {
            teamB.wins++;
            teamA.losses++;
        }
    
        teamA.pointsFor += scoreA;
        teamA.pointsAgainst += scoreB;
        teamB.pointsFor += scoreB;
        teamB.pointsAgainst += scoreA;
    
        console.log(`   ${teamA.name} - ${teamB.name} (${scoreA}:${scoreB})`);
        return { teamA, teamB, scoreA, scoreB };
    }
   

    drawQuarterFinals() {
        // Pokupi top 8 timova iz svih grupa
        const allTeams = this.getFinalRankings();
        const top8 = allTeams.slice(0, 8);
    
        if (top8.length < 8) {
            throw new Error('Not enough teams for the quarter-finals.');
        }
    
        // Podeli timove u šešire
        const potD = top8.slice(0, 2); // Top 2 teams
        const potE = top8.slice(2, 4); // Next 2 teams
        const potF = top8.slice(4, 6); // Next 2 teams
        const potG = top8.slice(6, 8); // Last 2 teams
    
     
        // Četvtfinalisti
        const quarterFinalMatches = [];
        

        // Napravi potencialne mečeve, ujedno vodeći računa da timovi iz iste grupe nisu igrali međusobno    
        const pots = [potD, potE, potF, potG];
    
  
        for (let i = 0; i < pots.length; i++) {
            for (let j = i + 1; j < pots.length; j++) {
                const potA = pots[i];
                const potB = pots[j];
                for (const teamA of potA) {
                    for (const teamB of potB) {
                        if (!this.areTeamsFromSameGroup(teamA, teamB)) {
                            quarterFinalMatches.push({ teamA, teamB });
                        }
                    }
                }
            }
        }
    
        // Obavezno tačno 4 meča
        const uniqueMatches = [];
        while (uniqueMatches.length < 4 && quarterFinalMatches.length > 0) {
            const match = quarterFinalMatches.pop();
            if (!uniqueMatches.some(m => (m.teamA === match.teamA && m.teamB === match.teamB) || (m.teamA === match.teamB && m.teamB === match.teamA))) {
                uniqueMatches.push(match);
            }
        }
    
         // Proveri da li imamo tačno 4 meča
        if (uniqueMatches.length !== 4) {
            console.error('Error in quarter-final matches: Expected exactly 4 matches.');
            console.error('Received:', uniqueMatches);
            return; // Zaustavi dalje izvršavanje
        }
    
        // Prikaži šešire
        console.log('Šeširi:');
      
        pots.forEach((pot, index) => {
            console.log(`    Šešir ${String.fromCharCode(68 + index)}`);  // 'D' = 68, 'E' = 69, itd.
            pot.forEach(team => console.log(`        ${team.name}`));
        });
        console.log('');
    
        // Prikaži četvrtfinalne mečeve
        console.log('Eliminaciona faza:');
        uniqueMatches.forEach((match, index) => {
            console.log(`    ${match.teamA.name} - ${match.teamB.name}`);
        });
        console.log('');
        console.log('Četvrtfinale rezultati:');
    
        // Simuliraj i sačuvaj rezultate
        this.eliminationResults.quarterFinals = this.simulateMatches(uniqueMatches);
        console.log('');
    }

    simulateEliminationRound(matches) {
        return matches.map(match => this.playMatch(match.teamA, match.teamB));
    }

    playEliminationPhase() {
        // Simuliraj i prikaži rezultate četvrtfinala
        this.drawQuarterFinals();
    
       
        const quarterFinalResults = this.eliminationResults.quarterFinals;
        const semiFinalMatches = [];
        const thirdPlaceTeams = [];
    
        // Proveri da li imam tačno 4 tima za četvrtfinale
        if (quarterFinalResults.length !== 4) {
            console.error('Error in quarter-final results: there should be exactly 4 matches.');
            console.error('Received:', quarterFinalResults);
            return; // Stop further execution to avoid errors
        }
    
        // Popuni mečeve za polufinale i timove za treće mesto
        quarterFinalResults.forEach(result => {
            if (result.scoreA > result.scoreB) {
                semiFinalMatches.push({ teamA: result.teamA, teamB: result.teamB });
                thirdPlaceTeams.push(result.teamB);
            } else {
                semiFinalMatches.push({ teamA: result.teamB, teamB: result.teamA });
                thirdPlaceTeams.push(result.teamA);
            }
        });
    
        // Proveri da li imam tačno 4 tima za polufinale
        if (semiFinalMatches.length !== 4) {
            throw new Error('Error in semi-final matches setup: there should be 4 teams.');
        }
    
        // Mečevi za polufinale
        console.log('Polufinale:');
        const semiFinalMatchesArray = [
            { teamA: semiFinalMatches[0].teamA, teamB: semiFinalMatches[1].teamA },
            { teamA: semiFinalMatches[2].teamA, teamB: semiFinalMatches[3].teamA }
        ];
    
        semiFinalMatchesArray.forEach((match, index) => {
            if (!match.teamA || !match.teamB) {
                console.error(`Match setup error: semiFinalMatchesArray[${index}] is missing a team.`);
            } else {
                console.log(`   ${match.teamA.name} - ${match.teamB.name}`);
            }
        });
        console.log('');
        console.log('Polufinale Rezultati:');
        const semiFinalResults = this.simulateEliminationRound(semiFinalMatchesArray);
    
        // Rezultati iz polufimala
        const winners = semiFinalResults.map(result => result.scoreA > result.scoreB ? result.teamA : result.teamB);
        const losers = semiFinalResults.map(result => result.scoreA > result.scoreB ? result.teamB : result.teamA);
        console.log('');
        
        // Utakmica za treće mesto
        console.log('Utakmica za treće mesto:');
        const thirdPlaceMatchResult = this.simulateEliminationRound([{ teamA: losers[0], teamB: losers[1] }])[0];
        console.log('');
    
        // Finale
        console.log('Finale:');
        const finalResult = this.simulateEliminationRound([{ teamA: winners[0], teamB: winners[1] }])[0];
    
        console.log('');
    
        // Dodeljivanje medalja
        const gold = finalResult.scoreA > finalResult.scoreB ? finalResult.teamA : finalResult.teamB;
        const silver = finalResult.scoreA > finalResult.scoreB ? finalResult.teamB : finalResult.teamA;
        const bronze = thirdPlaceMatchResult.scoreA > thirdPlaceMatchResult.scoreB ? thirdPlaceMatchResult.teamA : thirdPlaceMatchResult.teamB;
    
        console.log('Medalje:');
        console.log(`    1. ${gold.name}`);
        console.log(`    2. ${silver.name}`);
        console.log(`    3. ${bronze.name}`);
    }
    
    
    
    // Proveri da li su timovi iz iste grupe
    areTeamsFromSameGroup(teamA, teamB) {
        for (const groupName in this.groups) {
            const group = this.groups[groupName];
            if (group.getTeamByName(teamA.name) && group.getTeamByName(teamB.name)) {
                return true;
            }
        }
        return false;
    }
}


// Učitavanje i simulacija
fs.readFile('groups.json', 'utf8', (err, data) => {
    if (err) throw err;

    const tournament = new Tournament();
    const groupsData = JSON.parse(data);

    
    for (const groupName in groupsData) {
        tournament.addGroup(groupName);
        tournament.loadTeams(groupName, groupsData[groupName]);
    }

    tournament.simulateGroupStage();
    tournament.displayFinalRankings();
    tournament.playEliminationPhase();
});
