# Jev Marianne

**Versionne les engagements politiques et détecte comment les promesses sourcées évoluent dans le temps.**

[![Tests](https://github.com/gbesse/jev-marianne/actions/workflows/test.yml/badge.svg)](https://github.com/gbesse/jev-marianne/actions/workflows/test.yml) [MIT](LICENSE) · Node.js 22+ · v0.1.3 · Documentation française

Jev Marianne transforme des engagements politiques sourcés en enregistrements stables, puis classe une déclaration ultérieure comme nouvel engagement, clarification, reformulation, possible revirement ou propos sans rapport.

## Démarrage rapide

```sh
git clone https://github.com/gbesse/jev-marianne.git
cd jev-marianne
npm install
npm run demo
```

La démonstration utilise uniquement des données et probabilités synthétiques. Elle n’effectue aucun appel réseau et ne constitue pas une mesure de qualité de Jev.

## Exemple exécutable

Cet exemple compare deux engagements successifs sur le logement. Il utilise un fournisseur Jev simulé : aucune clé API ni connexion réseau n’est nécessaire. L’assertion intégrée fait échouer la commande si le comportement attendu change.

Le code complet de [`examples/demo.mjs`](examples/demo.mjs) est directement copiable :

```js
// Objectif : démontrer la frontière de décision sans appel réseau.
import assert from "node:assert/strict";
import { compareCommitments } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const base = {
  id: "logement-1",
  actor: "Candidate A",
  topic: "logement",
  text: "Construire 100 000 logements chaque année.",
  source: { url: "https://example.test/programme", date: "2026-01-10" },
};
const later = {
  ...base,
  id: "logement-2",
  text: "Viser jusqu’à 100 000 logements si les finances le permettent.",
  source: { url: "https://example.test/speech", date: "2026-09-01" },
};
const provider = createFakeProvider(() => ({
  model: "jev-1.13.0",
  answers: {
    relation: {
      type: "choice",
      choice: "possible_reversal",
      probabilities: {
        new_commitment: 0.02,
        reformulation: 0.08,
        clarification: 0.1,
        possible_reversal: 0.76,
        unrelated: 0.04,
      },
      confidence: 0.76,
    },
  },
  usage: { input_tokens: 180, output_tokens: 0 },
}));
const resultat = await compareCommitments(base, later, provider);
assert.equal(resultat.relation, "possible_reversal");
console.log(JSON.stringify(resultat, null, 2));
```

Lancez-le avec :

```sh
npm run demo:principal
```

Résultat à repérer : `relation: possible_reversal`.

### Cas limite à tester

Un engagement strictement identique est classé sans consulter Jev. Le code se trouve dans [`examples/cas-limite.mjs`](examples/cas-limite.mjs).

```sh
npm run demo:limite
```

Résultat à repérer : `relation: unchanged · appels Jev: 0`. La commande `npm run demo` exécute les deux exemples.

## Utilisation de la bibliothèque

Importez les fonctions métier depuis `@gbesse/jev-marianne`. Fournissez soit `createJevClient()` depuis l’export `./jev`, soit `createFakeProvider()` pour les tests hors ligne.

Les noms de l’API JavaScript restent stables pour préserver la compatibilité avec les versions précédentes. La documentation, les exemples et les explications destinées aux utilisateurs sont en français.

## Frontière de décision

Les identifiants, les dates et les égalités exactes restent traités par le code. Jev compare uniquement deux déclarations sourcées. Le résultat ne dit pas si une promesse est vraie, souhaitable, financée ou tenue.

La question exacte envoyée à Jev est versionnée dans [`src/index.mjs`](src/index.mjs). Les identifiants, dates, calculs, filtres, seuils et transitions d’état restent gérés par du code ordinaire.

## Sources

- [https://github.com/gbesse/decisionpacks](https://github.com/gbesse/decisionpacks)
- [https://github.com/gbesse/semantic-watch](https://github.com/gbesse/semantic-watch)

Conservez l’attribution amont, les identifiants d’origine, les URL de source et les dates de récupération avec chaque enregistrement dérivé.

## Appels Jev réels

Les appels réels sont facultatifs et payants. Le client fixe le modèle `jev-1.13.0`, valide l’identité du modèle et toutes les probabilités, refuse les redirections, ne retente que les erreurs réseau et les réponses HTTP 429/529, puis bloque les requêtes dépassant une estimation prudente de 24 000 jetons.

```sh
TYPESAFE_API_KEY=... node scripts/live-smoke.mjs
```

N’envoyez jamais de secret, de donnée personnelle ni de dossier sensible non expurgé. Évaluez le comportement sur un jeu représentatif de cas français avant tout usage opérationnel.

## Validation

```sh
npm run check
npm run typecheck
npm test
npm run demo
```

La CI exécute ces vérifications sous Node.js 22 et 24.

Projet indépendant, sans affiliation avec TypeSafe AI ni avec l’administration française. Consultez la [documentation de l’API Jev](https://docs.typesafe.ai/api) et les [limites du modèle](https://docs.typesafe.ai/model-jaggedness/jev-1.13).
