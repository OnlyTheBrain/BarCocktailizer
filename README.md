# Comptoir — Coûts et marges du bar

## Démarrer

Double-cliquez sur **index.html** pour ouvrir l’application dans un navigateur récent (Edge, Chrome ou Firefox). Gardez `index.html`, `style.css`, `seed.js`, `core.js` et `app.js` dans le même dossier. Aucun serveur, compte, bibliothèque distante ou installation n’est nécessaire.

## Fonctions

- **Analyse & simulation** : coûts HT, prix TTC, marge brute, taux de marque, simulation par prix ou pourcentage, projection du nombre de verres. Cliquer sur « Appliquer ce prix » pour enregistrer une simulation.
- **Carte des boissons** : créer, modifier et supprimer des recettes, dosages en cl, prix TTC et TVA de vente. Une boisson simple se crée avec un seul ingrédient (par exemple 50 cl de bière ou 33 cl de soda).
- **Produits & achats** : prix d’achat HT par bouteille ou fût, contenance en cl, catégorie, quantité de référence et TVA d’achat informative. Les changements de prix recalculent les recettes.
- **Données & sauvegardes** : export/import JSON et export CSV de l’analyse. L’import valide les données avant remplacement et demande confirmation.

La sauvegarde automatique utilise `localStorage`. Elle dépend du navigateur et de l’emplacement du fichier. Exportez régulièrement un JSON, notamment avant de déplacer le dossier ou d’effacer les données du navigateur. En cas d’impossibilité d’écriture, une alerte invite à exporter la session en mémoire.

## Données initiales

Transcription de `Facture FA000096.pdf` du 30/09/2026 et de `cocktails.pdf`, fournis par l’utilisateur, puis compléments communiqués dans la conversation :

- 19 boissons de la facture (767,17 € HT), plus le Perrier à 1,11 € HT / 33 cl ; quantité Perrier non renseignée, représentée par 0.
- Consignes de 50 € séparées du coût matière ; total facture 817,17 € HT et 957,49 € TTC.
- Moretti : 24 litres à 4,18 € HT/litre, convertis en 3 fûts de 8 L à 33,44 € HT.
- Prosecco : contenance 75 cl confirmée par l’utilisateur.
- Hugo Spritz 10 € TTC ; Aperol Spritz 9 € ; Kir Cassis 4,50 € ; Kir Pétillant 8 € ; Biarritz Bonheur 8 € dans ses 3 parfums.
- Les doses sont celles de la carte. La fleur de sureau est associée à Madame Sureau bio.

Les PDF sources ne sont pas copiés dans le dossier distribuable. Les coordonnées personnelles et bancaires de la facture ne sont pas incluses dans l’application.

## Calculs et limites

Coût ingrédient HT = prix du conditionnement HT / contenance × dose.

Coût recette HT = somme des ingrédients / (1 − pertes / 100) + frais HT par verre.

Vente HT = prix TTC / (1 + TVA de vente / 100). Marge brute = vente HT − coût recette HT. **Taux de marque** = marge brute / vente HT × 100. Ce pourcentage est distinct du taux de marge sur coût d’achat.

Les cocktails fournis sont paramétrés avec une TVA de vente de 20 %, modifiable. Les prix d’achat sont utilisés HT ; la TVA d’achat est conservée à titre informatif. Ce modèle suppose un suivi en HT.

Les coûts ne comprennent pas les salaires ni les charges fixes. Pertes et frais par verre (glace, garnitures…) sont initialisés à zéro et peuvent être renseignés. Aucun suivi des ventes réelles ou des consommations de stock n’est effectué. Les quantités sont des références d’achat, pas un inventaire actuel garanti. La projection est théorique ; les indicateurs globaux supposent une vente de chaque recette complète avec prix.

Les recettes à coût incomplet ne participent pas aux indicateurs de marge globaux. Un coût partiel est indiqué « ≥ ». Les arrondis sont appliqués à l’affichage ; le prix cible est arrondi au centime supérieur.

## GitHub Pages (facultatif)

Déposer les cinq fichiers applicatifs à la racine d’un dépôt GitHub, puis activer Pages depuis la branche et le dossier racine. L’application reste statique, sans backend. Chaque utilisateur et chaque navigateur conservent leur propre base locale ; il n’y a pas de synchronisation entre postes. Les données initiales de `seed.js` seront visibles pour les personnes ayant accès au site/dépôt.

## Vérifier les calculs

Avec Node.js installé : `node --test tests/core.test.cjs`.
