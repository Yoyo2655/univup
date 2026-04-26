import { NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })

const PROGRAMMES = {
  Maths: `
PROGRAMME MATHS GEI :
- Analyse réelle : limites, continuité, dérivabilité, théorème des valeurs intermédiaires, DL, convexité, étude de fonctions
- Intégration : calcul d'intégrales, intégration par parties, changement de variable, intégrales impropres, critères de convergence
- Séries numériques : critères de convergence (Riemann, comparaison, d'Alembert, Cauchy), séries alternées
- Séries entières : rayon de convergence, développements classiques, opérations sur les séries entières
- Suites et récurrences : convergence, suites monotones, suites récurrentes linéaires et non linéaires, points fixes
- Équations différentielles : EDO du 1er ordre (linéaires, à variables séparables), EDO du 2e ordre à coefficients constants, solutions particulières
- Algèbre linéaire : espaces vectoriels, applications linéaires, rang, noyau, image, théorème du rang
- Matrices : opérations, rang, inversibilité, systèmes linéaires, méthode de Gauss
- Valeurs propres et vecteurs propres : diagonalisation, trigonalisation, polynôme caractéristique, endomorphismes
- Formes bilinéaires et quadratiques : produit scalaire, norme, orthogonalité, projection orthogonale, matrices symétriques
- Géométrie : droites et plans dans R2/R3, distances, angles, symétries, projecteurs
- Fonctions de plusieurs variables : dérivées partielles, gradient, Hessienne, extrema locaux, points selle`,

  Physique: `
PROGRAMME PHYSIQUE GEI :
- Mécanique classique : lois de Newton, bilan des forces, travail, énergie cinétique, énergie potentielle, conservation de l'énergie
- Oscillateurs : oscillateur harmonique libre, amorti, forcé, résonance, facteur de qualité
- Cinématique : mouvement rectiligne, circulaire, référentiels, équations du mouvement
- Ondes : ondes progressives, stationnaires, interférences, diffraction, effet Doppler
- Électricité : lois de Kirchhoff, circuits RC/RL/RLC, régimes transitoires et permanent, impédances complexes
- Optique géométrique : lois de Snell-Descartes, réflexion, réfraction, lentilles minces, formation d'images
- Thermodynamique : premier et deuxième principe, cycles thermodynamiques, entropie, machines thermiques
- Électromagnétisme : champ électrique, potentiel, champ magnétique, loi de Biot-Savart, induction, équations de Maxwell`,

  Proba: `
PROGRAMME PROBABILITÉS GEI :
- Espaces de probabilité : événements, axiomes, probabilité conditionnelle, formule de Bayes, indépendance
- Variables aléatoires discrètes : loi de probabilité, espérance, variance, lois usuelles (Bernoulli, Binomiale, Poisson, Géométrique, Hypergéométrique)
- Variables aléatoires continues : densité de probabilité, fonction de répartition, lois usuelles (Uniforme, Exponentielle, Normale, Gamma)
- Moments : espérance, variance, écart-type, covariance, coefficient de corrélation, inégalités (Markov, Bienaymé-Tchebychev)
- Couples de variables aléatoires : loi jointe, lois marginales, indépendance, loi conditionnelle, espérance conditionnelle
- Convergences : loi des grands nombres, théorème central limite, convergence en probabilité, en loi
- Fonctions génératrices et transformées : fonction génératrice des moments, transformée de Laplace
- Processus : chaînes de Markov (discrètes), états absorbants, matrices de transition, loi stationnaire`,

  Info: `
PROGRAMME INFORMATIQUE GEI :
- Algorithmique : complexité temporelle et spatiale (notation O, Omega, Theta), récursivité, algorithmes de tri (tri fusion, rapide, par tas)
- Structures de données : tableaux, listes chaînées, piles, files, arbres binaires, arbres de recherche, tas, graphes
- Logique et arithmétique : logique propositionnelle, raisonnement par récurrence, arithmétique modulaire, PGCD, algorithme d'Euclide
- Graphes : représentations (matrice d'adjacence, liste), parcours (BFS, DFS), plus court chemin (Dijkstra, Bellman-Ford), arbres couvrants
- Théorie des langages : automates finis déterministes et non-déterministes, expressions régulières, grammaires formelles
- Programmation dynamique : principe d'optimalité, mémoïsation, exemples classiques (sac à dos, plus longue sous-séquence)
- Bases de données : modèle relationnel, algèbre relationnelle, requêtes SQL, normalisation
- Systèmes : processus, ordonnancement, mémoire virtuelle, synchronisation, interblocage`
}

export async function POST(request) {
  try {
    const { matiere, nbQuestions } = await request.json()

    const programmeSpecifique = PROGRAMMES[matiere] || PROGRAMMES['Maths']

    const systemPrompt = `Tu es un concepteur expert de questions de type GEI-Univ (admissions parallèles Grandes Écoles d'ingénieurs : X, ENSTA, Mines Paris, Mines Saint-Etienne, Mines Nancy, ENSAE, ESTP, Ponts et Chaussées, Télécom Paris, ISAE-Supaero).

MISSION GLOBALE
Tu dois INVENTER des questions nouvelles, originales et rigoureuses de niveau GEI en ${matiere}, dans l'esprit des annales GEI récentes.
Tu ne dois JAMAIS recopier, paraphraser trop près, ni reformuler trivialement une question existante.

STYLE CIBLE
- Énoncé compact et précis
- 5 propositions notées A, B, C, D, E — chacune est une affirmation vraie ou fausse
- Entre 1 et 5 réponses exactes possibles (varier d'une question à l'autre)
- Le style est : "Lesquelles des affirmations suivantes sont vraies ?"
- Ton sobre, académique, sans bavardage
- Questions indépendantes les unes des autres
- Pas de démonstration demandée dans l'énoncé
- Formulation naturelle en français scientifique

${programmeSpecifique}

REPARTITION DES THEMES
Quand tu génères plusieurs questions, varie les thèmes du programme ci-dessus.
Évite de faire plusieurs questions consécutives du même chapitre.
Cherche un équilibre comme dans une vraie épreuve.

NATURE DES BONNES REPONSES
- Il peut y avoir 1, 2, 3, 4 ou 5 bonnes réponses par question
- Le nombre de bonnes réponses doit varier d'une question à l'autre de façon imprévisible
- Ne jamais indiquer dans l'énoncé combien il y a de bonnes réponses

CONSTRUCTION DES PROPOSITIONS
- Au moins 3 propositions crédibles par question
- Les fausses réponses doivent correspondre à de vraies erreurs classiques :
  * En Maths : oubli de domaine, confusion injective/surjective, erreur de signe, confusion convergence simple/uniforme, minimum local/global, confusion rang/dimension du noyau
  * En Physique : erreur de signe dans un bilan, oubli d'une force, confusion énergie/puissance, erreur de phase, mauvaise application d'un principe
  * En Proba : confusion indépendance/corrélation nulle, erreur sur la variance d'une somme, mauvaise application de Bayes, confusion loi marginale/conditionnelle
  * En Info : erreur de complexité, oubli d'un cas de base, confusion entre structures, mauvaise interprétation d'un algorithme
- Éviter les distracteurs trop faciles à éliminer ou grotesques

CALIBRAGE
- Nombres simples mais pas trop ronds
- Constantes classiques si utiles : e, ln 2, pi, sqrt(2)
- Résultats exploitables sans calculatrice
- Calibré pour un concours de 2 heures (questions rapidement lisibles mais techniquement non triviales)

ORIGINALITE OBLIGATOIRE
Pour chaque question, impose au moins 2 éléments d'originalité :
- Contexte mathématique/scientifique différent des classiques
- Formulation différente
- Mélange de deux notions
- Piège conceptuel nouveau
- Paramétrage inhabituel mais raisonnable

PRIORITE ABSOLUE : rigueur > originalité > ressemblance superficielle

INTERDICTIONS ABSOLUES
- Ne jamais recopier ou trop paraphraser une annale connue
- Ne jamais faire une question incomplète ou ambiguë
- Ne jamais produire des distracteurs absurdes
- Ne jamais faire d'erreur mathématique ou scientifique dans les réponses
- Avant chaque question, vérifier mentalement qu'elle n'est pas une reformulation d'un classique — si oui, la remplacer

AUTO-CONTROLE AVANT REPONSE
Vérifie silencieusement :
1. Cohérence scientifique de chaque question
2. Existence réelle des bonnes réponses
3. Unicité ou multiplicité correcte des bonnes réponses
4. Absence d'erreur de calcul ou de raisonnement
5. Originalité suffisante vis-à-vis des annales classiques`

    const userPrompt = `Génère ${nbQuestions} questions de QCM de ${matiere} dans le style exact du GEI pour des étudiants L3/M1.

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, sans balises markdown :
{
  "questions": [
    {
      "enonce": "texte de la question",
      "propositions": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "bonnes_reponses": [0, 2],
      "explication": "Explication détaillée : A est vraie car... B est fausse car... C est vraie car... D est fausse car... E est fausse car..."
    }
  ]
}`

    const result = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    })

    const text = result.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}