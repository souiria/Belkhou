const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/maintenance.db');

const rawData = `29	P2QO	HAB	Emballage	Chariot endommagé	6/1/2026	Reparation du chariot	sellam	RAJAE	6/15/2026	100%			
30	P2QO	HAB	TEST ELECTRIQUE	Chariot endommagé	6/1/2026	Reparation chariot	sellam	RAJAE	6/15/2026	100%			
31	D3P2	PAVILLON P24	LAD	Manque toufix	6/1/2026	Fixation des toufix manquants	ADIB	EL HARTI	6/15/2026	100%			
32	D3P2	R F DOOR P24	LAD	Manque toufix	6/1/2026	fixation des toufix manquants	ADIB	EL HARTI	6/15/2026	100%			
33	D3P2	R F DOOR P24	LAD	Levier du pistolet endommagé	6/1/2026	Changement levier endommagé	ADIB	EL HARTI	6/22/2026	0%			
34	EVMP	MSB BEV	TEST ELECTRIQUE	Manque vis de fixation	6/1/2026	Ajout des vis manquants	Sellam	LOUBNA	6/15/2026	100%	100%		
35	D3P2	PAVILLON P24	LAD	Manque toufix	6/1/2026		ADIB	ZAHIRA	6/15/2026	100%			
36	D3P2	R F DOOR P21	LAD	Levier du pistolet endommagé	6/1/2026	Changement levier endommagé	ADIB	ZAHIRA	6/22/2026	0%			
37	D3P2	REAR DOOR1 P21	LAD STATION 3	Lampe ne fonctionne pas	6/1/2026	Changement du lampe brulée	ADIB	FOUZIA	6/22/2026	100%	100%		
38	D3P2	VOLET P24	LAD	Manque toufix	6/1/2026	Ajout des toufix manquants	ADIB	HASNAE	6/15/2026	100%			
33	D3P2	VOLET P24	LAD	Levier du pistolet endommagé	6/1/2026	Changement levier endommagé	ADIB	EL HARTI	6/15/2026	100%			
33	D3P2	L F DOOR P21	LAD	Levier du pistolet endommagé	6/1/2026	Changement levier endommagé	ADIB	EL HARTI	6/22/2026	0%			
38	D3P2	L F DOOR P21	LAD	Manque toufix	6/1/2026	Ajout des toufix manquants	ADIB	HASNAE	6/22/2026	0%			
39	D3P2	L F DOOR P21	LAD (Station 1 + 2 + 13 + 16)	4 Lampes non fonctionnelles	6/1/2026	"Changement des lampes non fonctionnelles 
apres reception du commande"	ALI	FATIMA WISSA	6/29/2026	0%			
40	D3P2	VOLET P21	TEST ELECTRIQUE	Support Lampe du test electrique cassé	6/1/2026	Changement support du lampe	ADIB	FATIMA WISSA	6/15/2026	100%			
41	CP4X	PPL 1	TORQUE MACHINE	Reparation temporaire sur bras de vissage	6/1/2026	Correction du reparation temporaire	ADIB	ILHAM	6/15/2026	100%	100%		
42	CP4X	PPL 1	TEST ELECTRIQUE	Porte du test electrique cassée	6/14/2026	Reparation du porte cassée	SELLAM	ILHAM	6/15/2026	0%			
43	OV64	VOLET	LAD (Station 10)	Lampe non fonctionnelle	5/2/2026	Chagement lampe NOK	ALI	LAMIAE	6/1/2026	100%			
44	P2QO	HAB	TEST CLIP	Levier du pistolet endommagé	6/1/2026	Changement levier endommagé	SELLAM	RAJAE	6/8/2026	100%	100%		
45	P2QO	HAB 	CPG	Plexiglass du CP cassé	6/14/2026	Changement plexiglass (en attente du commande)	ADIB	RAJAE	7/27/2026	0%			
46	CP4X	L/R FRONT DOOR	TEST ELECTRIQUE	Manque identification des CP	6/8/2026	Ajout d'identification manquantes	ALI	BADIAA	6/15/2026	100%	100%		
47	CP4X	PAVILLON / VOLET	STATION 4	CP cassé au LAD	6/1/2026	Changement CP cassée	ALI	BADIAA	6/1/2026	100%	100%		
48	CP4X	PDB	LAD	Manque Toufix	6/18/2026	Ajout des toufix manquants	ALI	NAWAL	6/29/2026	0%			
49	CP4X	VOLET	TEST ELECTRIQUE	Contre partie cassée	6/1/2026	Changement cp cassée	ALI	badiaa	6/8/2026	100%			
50	CP4X	L/R FRONT DOOR	TEST ELECTRIQUE	Manque identification	6/8/2026	Ajout d'identification manquante	ALI	BADIAA	6/15/2026	100%			
51	P2QO	PPL 2	TEST ELECTRIQUE	Manque vis de fixation	6/1/2026	ajout des vis de fixation	Salem	LATIFA	6/8/2026	100%			
52	P2QO	PPL 2	Chariot Kitter	Manque etiqutte preventive	6/1/2026	Ajout d'etiquette	SALEM	LATIFA	6/8/2026	100%			
53	D3P2	VOLET P24	LAD	Levier déchiré	5/13/2026	Changement levier déchiré	ALI	RAJAE	5/20/2026	100%			
54	CP4X	smalls	TEST ELECTRIQUE	manque identification	5/2/2026	Ajout d'identification manquante	sellam	HAFSAE	5/4/2026	100%			
54	CP4X	smalls	TEST ELECTRIQUE	Porte du test electrique cassée	5/2/2026	Reparation du porte cassée	SALEM	HAFSAE	5/11/2026	100%			
55	P2QO	PPL 2	PISTOLET R2	Levier non ok	5/2/2026	Changement du levier endommagé	SALEM	LATIFA	5/4/2026	100%			
55	P2QO	PPL 2	PISTOLET R2	Levier non ok	5/14/2026	Changement du levier endommagé	SALEM	LATIFA	5/15/2026	100%			
56	P2QO	PPL 2	TEST VISION	Scan avec reparation temporaire	5/5/2026	Changement lecteur scan	SALEM	LATIFA	5/11/2026	100%			
56	P2QO	PPL 2	Chariot 	peinture du chariot dégradé	5/2/2026	renouveler la peinture du chariot	SALEM	LATIFA	5/25/2026	100%			
57	P2QO	PPL 2	TEST CLIP	Contre partie cassée	5/2/2026	Changement du cp cassée	SALEM	LATIFA	5/11/2026	100%			
55	P2QO	PPL 2	PISTOLET R6 	Levier non ok	5/13/2026	Changement du levier endommagé	SALEM	LATIFA	5/15/2026	100%			
55	P2QO	PPL 2	PISTOLET V2 	Levier non ok	5/2/2026	Changement du levier endommagé	SALEM	LATIFA	5/11/2026	100%			
55	CP4X	PPL 1	TEST BRACKET	Levier non ok	5/18/2026	Changement du levier endommagé	SALEM	LATIFA	5/25/2026	100%			
55	CP4X	PPL 1	TEST VISION	Manque des vis de fixation	5/2/2026	Ajout des vis	MAINT	LATIFA	5/18/2026	100%			
55	CP4X	PPL 1	TEST VISION	Masque fuse cassé	5/2/2026	changement masque Fuse	MAINT	LATIFA	5/18/2026	100%			
55	CP4X	PPL 1	PREBLOCK	Etiquette preventive non Ok	5/2/2026	changement Etiquette preventive	MAINT	LATIFA	5/11/2026	100%			
55	CP4X	PPL 1	TEST ELECTRIQUE 	Contre partie cassée	5/2/2026	Reparation du cp cassée	MAINT	LATIFA	5/18/2026	100%			
55	CP4X	PPL 1	TEST CLIP	Les contre parties mal fixé	5/21/2026	Assurer la bonne fixation des cp	MAINT	LATIFA	5/21/2026	100%			
58	P2QO	HAB	CARROUSEL	Support lay-up barre non ok	5/2/2026	A reparer	SALEM	LATIFA	5/11/2026	100%			
58	P2QO	HAB	CPG	CP CPG NOK	5/9/2026	A reparer	ADIB	LATIFA	5/18/2026	100%			
58	P2QO	HAB	TEST BRACKET	SABOT DU PISTOLET NON OK	5/10/2026	A reparer	SALEM	LATIFA	5/11/2026	100%			
58	P2QO	HAB	TEST BRACKET	Manque vis de fixation	5/2/2026	Ajout des vis 	SALEM	LATIFA	5/11/2026	100%			
58	P2QO	HAB	TEST BRACKET	Reparation temporaire sur Table	5/2/2026	Ajout des vis 	SALEM	LATIFA	5/11/2026	100%			
58	P2QO	HAB	TEST ELECTRIQUE	Manque vis et identification du cp	5/2/2026	Ajout des vis 	SALEM	LATIFA	5/11/2026	100%			
59	P2QO	PDB	TABLE FIXE	Peinture dégradé	5/2/2026	Renouvelemnt de peinture	AMINE	LAILA	6/8/2026	100%			
59	P2QO	PDB	PREBLOCK	Manque etiqutte preventive	5/2/2026	Ajout d'etiquette manquante	SAID	LAILA	5/4/2026	100%			
60	CP4X	HAB	CPG	Contre partie CPG cassée	4/1/2026	Changement du CP cassée	AMINE	MAJDOULINE	5/4/2026	100%			
60	CP4X	HAB	TEST VISION	Plaque d'allignement du Contre partie usé	4/1/2026	Changement Plaque d'allignement	AMINE	MAJDOULINE	4/27/2026	100%			
60	CP4X	HAB	PISTOLET	Manque levier 	4/1/2026	Changement du levier endommagé	AMINE	MAJDOULINE	4/6/2026	100%			
61	P2QO	PPL 1	TABLE MODULE	Manque etiquette preventive	5/8/2026	Ajout d'etiquette preventive	SAID	SIHAM	5/11/2026	100%			
61	P2QO	PPL 1	PISTOLET	Levier pistolet déchiré	5/20/2026	Changement du levier endommagé	SALEM	SIHAM	5/25/2026	100%			
62	CP4X	HAB	CARROUSEL	boutton Start-Stop NOK	5/2/2026	reparation du boutton start-stop	ALI	MAJDOULINE	5/11/2026	100%			
62	CP4X	HAB	TEST BRACKET	Cp mal fixé	5/2/2026	Assurer la bonne fixation de cp	ILYASS	MAJDOULINE	5/4/2026	100%			
63	CP4X	HAB	PISTOLET	Manque levier 	5/2/2026	Changement du levier endommagé	ALI	MAJDOULINE	5/11/2026	100%			`;

// Convertir de M/D/YYYY vers YYYY-MM-DD
function formatDate(dateStr) {
    if (!dateStr) return null;
    let s = dateStr.trim();
    if (!s.includes('/')) return s;
    const parts = s.split('/');
    if(parts.length < 3) return s;
    const m = parts[0].padStart(2, '0');
    const d = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
}

db.serialize(() => {
    // On efface les anciennes données pour avoir une base propre avant l'importation de masse
    db.run("DELETE FROM issues");

    const stmt = db.prepare(`INSERT INTO issues
        (project, line, station, problem, problem_date, action, responsible, team_leader, due_date, actual_closure_date, status, sers_num, comments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // 1. Gérer les retours à la ligne capricieux provenant d'Excel (ex: ligne 39)
    let cleanData = rawData.replace(/"([^"]*)"/g, (match, p1) => p1.replace(/[\r\n]+/g, ' ').trim());

    // 2. Découper ligne par ligne de manière sécurisée
    const rows = cleanData.trim().split(/[\r\n]+/);
    let attempted = 0;

    rows.forEach((row, index) => {
        let cols = row.split('\t').map(c => c.trim());
        if (cols.length < 5) return; // Ignore les lignes vides accidentelles

        attempted++;

        let actual_closure = cols[10] ? cols[10] : '';
        let status = cols[11] ? cols[11] : '';
        let sers = cols[12] ? cols[12] : '';
        let comments = cols[13] ? cols[13] : '';

        // 3. Correction Intelligente : Si Excel a décalé le pourcentage (100%) vers la colonne de Date
        if (actual_closure.includes('%') && status === '') {
            status = actual_closure;
            actual_closure = '';
        } else if (actual_closure.includes('%') && status.includes('%')) {
            actual_closure = ''; // Cas spécifique où Excel duplique le "100%"
        }

        const project = cols[1];
        const line = cols[2];
        const station = cols[3];
        const problem = cols[4];
        const problem_date = formatDate(cols[5]);
        const action = cols[6] || '';
        const resp = cols[7] || '';
        const leader = cols[8] || '';
        const due_date = formatDate(cols[9]);
        actual_closure = formatDate(actual_closure);
        
        if (!status) status = '0%';

        // 4. Insertion avec traçage des erreurs SQL
        stmt.run(project, line, station, problem, problem_date, action, resp, leader, due_date, actual_closure, status, sers, comments, function(err) {
            if (err) {
                console.error(`❌ Échec de la ligne ${index + 1} (${project} - ${problem}): ${err.message}`);
            }
        });
    });

    stmt.finalize(() => {
        // Obtenir le vrai total depuis SQLite à la fin du traitement
        db.get("SELECT COUNT(*) as total FROM issues", (err, row) => {
            console.log(`\n✅ Importation terminée ! La table contient maintenant exactement ${row.total} lignes de problèmes.`);
        });
    });
});