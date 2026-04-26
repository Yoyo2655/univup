# UnivUp — Contexte projet

## Stack
- Next.js 16.2.4 (App Router, pas TypeScript)
- Supabase (auth + base de données + storage Realtime)
- Déployé sur Vercel : https://univup.vercel.app
- GitHub : https://github.com/Yoyo2655/univup

## Structure des dossiers
```
univup/
  app/
    page.js                      → Page de connexion
    api/
      create-user/route.js       → Créer un user (service role key)
      drive/
        list/route.js            → Lister fichiers Drive (+ recherche globale)
        file/route.js            → Récupérer fichier Drive en base64
      gei/
        generate/route.js        → Générer QCM GEI avec Gemini IA
    admin/
      layout.js + sidebar.js
      page.js                    → Tableau de bord (stats réelles + alertes + financier)
      planning/page.js           → Planning global + création séances
      eleves/page.js             → Élèves + abonnements + paiements + profil concours + changement de pack
      profs/page.js              → Gestion profs
      salaires/page.js           → Salaires profs (barème + calcul auto + versements)
      packs/page.js              → Gestion des packs d'abonnement (CRUD)
    prof/
      layout.js + sidebar.js
      page.js                    → Planning prof
      appel/page.js              → Feuille d'appel (présence + note + feedback)
      salaire/page.js            → Vue salaire prof
      ressources/page.js         → Bibliothèque Drive
    eleve/
      layout.js + sidebar.js
      AccesProtege.js            → Composant de protection (vérifie is_active)
      page.js                    → Planning élève (protégé)
      profil/page.js             → Profil concours (fac, dominante, écoles cibles, GEI)
      resultats/page.js          → Résultats (notes + moyenne par matière + taux présence) (protégé)
      biblio/page.js             → Bibliothèque Drive + viewer PDF + recherche (protégé)
      gei/page.js                → Prépa GEI QCM multi-réponses + Gemini IA (protégé)
      abonnement/page.js         → Abonnement + packs + modale RIB + changement de pack
    chat/
      layout.js                  → Détecte rôle, affiche bonne sidebar
      page.js                    → Chat général temps réel (texte + fichiers + images)
  lib/
    supabase.js
    google.js                    → Client Google Drive API
    theme.js                     → export const t = { bg, surface, surface2, text, muted, muted2, purple, teal, blue, amber, coral, border, border2 }
  public/
    pdf.worker.min.mjs           → Worker PDF.js (copié depuis pdfjs-dist/legacy)
```

## Variables d'environnement (.env.local ET Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://owtubcuiogcdgsbhmsfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=univup-drive-service@univup-drive.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_DRIVE_FOLDER_ID=1WgSIDIWaOQ9E_pq_0yjD1R_79CK_8XAr
GEMINI_API_KEY=...
```

## Base de données Supabase
- users (id, email, full_name, role, is_active, created_at)
- groupes, groupe_eleves
- seances (id, type, titre, matiere, date_debut, date_fin, salle, prof_id, groupe_id, statut)
- seance_eleves (seance_id, eleve_id, presence, note, feedback, feedback_at)
- abonnements (id, eleve_id, pack_nom, statut, date_debut, date_fin, montant, reference_virement)
- paiements_eleves (id, abonnement_id, montant, date_virement, valide_par)
- bareme_profs (id, prof_id, tarif_kholle, tarif_cours_solo, tarif_cours_groupe, tarif_par_eleve, seuil_eleves)
- salaires_profs (id, prof_id, mois, montant_du, montant_verse, date_versement, statut)
- messages (id, user_id, contenu, fichier_url, fichier_type, fichier_nom, created_at) — Realtime activé
- profils_eleves (eleve_id PK, fac_origine, statut_etudiant, annee_concours, dominante_centrale, concours_vises[], ecoles_cibles[], ecoles_gei[])
- packs (id, nom, description, prix, duree_mois, actif, ordre, created_at)

## Storage Supabase
- bucket chat-files (public) — fichiers/images du chat

## Ce qui est fonctionnel ✅
- Auth 3 rôles + redirection automatique
- Admin : dashboard stats réelles + alertes + financier
- Admin : CRUD élèves + abonnements + virements + activation accès
- Admin : changement de pack avec calcul automatique du reste à payer
- Admin : CRUD profs + salaires avec barème configurable + calcul automatique
- Admin : planning global + création séances
- Admin : gestion packs d'abonnement (créer/modifier/activer/désactiver/supprimer)
- Prof : planning + feuille d'appel + salaire + bibliothèque Drive
- Élève : profil concours (fac, dominante, écoles cibles, GEI)
- Élève : planning + résultats (notes + moyenne par matière de khôlle) + abonnement
- Élève : abonnement avec packs disponibles + modale RIB + demande changement de pack via chat
- Protection accès : planning, résultats, biblio, GEI bloqués si is_active = false
- Bibliothèque Drive : navigation dossiers + viewer PDF canvas + images + recherche globale
- Module GEI : QCM format réel GEI (1-5 bonnes réponses, 5 propositions), génération Gemini IA
- Chat général temps réel : 3 rôles, badges colorés, texte + images + fichiers
- Thème couleurs centralisé dans lib/theme.js
- Déploiement Vercel automatique via GitHub push

## Informations bancaires (dans code abonnement)
- Bénéficiaire : YONI MILO ATTAL
- IBAN : FR76 2823 3000 0191 3356 4211 372
- BIC : REVOFRP2
- Banque : Revolut France

## Workflow déploiement
```bash
git add . && git commit -m "description" && git push
```

## Points techniques importants
- PDF viewer : pdfjs-dist legacy build, worker copié dans /public/pdf.worker.min.mjs
- Création users : API route /api/create-user avec SUPABASE_SERVICE_ROLE_KEY
- Google Drive : compte de service partagé sur dossier UnivUp-webapp (ID: 1WgSIDIWaOQ9E_pq_0yjD1R_79CK_8XAr)
- Gemini : modèle gemini-2.0-flash-lite, clé depuis aistudio.google.com
- Chat Realtime : alter publication supabase_realtime add table messages
- Khôlles : matières = Maths, Physique, Anglais, Motivation, Info (+ Autre)
- Protection accès : composant AccesProtege.js vérifie is_active dans users
- Changement de pack admin : calcule automatiquement nouveau reste = prix nouveau pack - total déjà versé

## Ce qui reste à construire
- [ ] RLS affinées par rôle (actuellement tout en true)
- [ ] Notifications email (rappels séances, feedback posté)
- [ ] Annales GEI saisies en base (en complément génération IA)