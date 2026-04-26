import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { matiere, nbQuestions } = await request.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

    const prompt = `Tu es un expert en préparation au concours GEI (Grandes Ecoles par voie Universitaire) pour les écoles suivantes : X, ENSTA, Mines Paris, Mines Saint-Etienne, Mines Nancy, ENSAE, ESTP, Ponts et Chaussées, Télécom Paris, ISAE-Supaero.

Génère ${nbQuestions} questions de QCM de ${matiere} dans le style exact du GEI, pour des étudiants L3/M1.

RÈGLES IMPORTANTES :
- Chaque question a exactement 5 propositions (A, B, C, D, E)
- Chaque proposition est une affirmation vraie ou fausse
- Il peut y avoir entre 1 et 5 bonnes réponses par question
- Le style est : "Lesquelles des affirmations suivantes sont vraies ?"
- Niveau rigoureux : analyse, algèbre linéaire, probabilités, suites, séries, équations différentielles
- Les propositions sont des affirmations mathématiques précises, pas des calculs directs

EXEMPLES de questions typiques GEI Maths :
- Fonctions C1, monotonie, extrema
- Suites récurrentes, convergence, points fixes
- Matrices stochastiques, valeurs propres, diagonalisabilité
- Variables aléatoires, moments, indépendance
- Séries entières, rayon de convergence
- Équations différentielles, solutions bornées

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, sans balises markdown :
{
  "questions": [
    {
      "enonce": "texte de la question",
      "propositions": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "bonnes_reponses": [0, 2],
      "explication": "Explication détaillée : A est vraie car... B est fausse car... etc."
    }
  ]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}