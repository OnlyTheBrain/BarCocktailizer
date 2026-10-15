/* Données transcrites de FA000096 et cocktails.pdf. Aucun prix de vente inventé. */
globalThis.BAR_SEED = {
  version: 1,
  products: [
    ['moretti','Moretti blonde · Blade 8 L','Bières',800,33.44,3,20,'24 L facturés à 4,18 € HT/L, soit 3 fûts de 8 L.'],
    ['menthe','Biarritz Bonheur · Menthe','Spiritueux',70,15.90,2,20,''],
    ['citron','Biarritz Bonheur · Citron','Spiritueux',70,15.90,1,20,''],
    ['framboise','Biarritz Bonheur · Framboise','Spiritueux',70,15.90,1,20,''],
    ['sureau','Madame Sureau bio','Liqueurs',70,18.25,2,20,'Fleur de sureau de la recette associée à cette liqueur.'],
    ['aperol','Aperol','Spiritueux',100,17.95,2,20,''],
    ['prosecco','Prosecco Frizzante Minos / Riondo','Vins',75,7.70,12,20,'Contenance de 75 cl confirmée par vous.'],
    ['chambre','La Chambre d’Amour · L’Originale','Vins',75,5.99,12,20,''],
    ['chardonnay','Chardonnay blanc IGP Castelnau','Vins',75,5.50,6,20,''],
    ['croze','En Long Large Travers · Fond Croze','Vins',75,5.90,6,20,''],
    ['hermitage','Crozes-Hermitage · Clémence rouge 2022','Vins',75,11.79,6,20,''],
    ['rose','Depuis 80 · Rosé de la Sanglière','Vins',75,4.90,6,20,''],
    ['cassis','Crème de cassis Bigallet','Liqueurs',100,14.25,3,20,''],
    ['bavaria','Bavaria sans alcool','Bières',33,1,24,20,'TVA d’achat de 20 % reproduite de la facture.'],
    ['desperados','Desperados','Bières',33,1.70,24,20,''],
    ['cocazero','Coca-Cola Zero','Softs',33,0.99,24,5.5,''],
    ['coca','Coca-Cola','Softs',33,1.13,24,5.5,''],
    ['cherry','Coca-Cola Cherry','Softs',33,0.89,24,5.5,''],
    ['fuzetea','Fuze Tea','Softs',25,0.76,24,5.5,''],
    ['perrier','Perrier','Softs',33,1.11,0,5.5,'Prix et contenance communiqués par vous ; quantité non renseignée.']
  ].map(([id,name,category,volume,price,quantity,tax,note])=>({id,name,category,volume,price,quantity,tax,note,confirmed:true,source:id==='perrier'?'Saisie utilisateur':'Facture FA000096 · 30/09/2026'})),
  recipes: [
    ['hugo','Hugo Spritz','Spritz',[['sureau',4],['prosecco',6],['perrier',6]],'7 glaçons, grand verre ballon. Mélanger doucement à la cuillère.'],
    ['aperolspritz','Aperol Spritz','Spritz',[['aperol',6],['prosecco',9],['perrier',3]],'8 glaçons, grand verre ballon. Mélanger doucement à la cuillère.'],
    ['kir','Kir Cassis','Apéritifs',[['cassis',2],['chardonnay',8]],'Servir dans un verre à flûte.'],
    ['kirpetillant','Kir Pétillant','Apéritifs',[['cassis',2],['prosecco',8]],'Servir dans un verre à flûte.'],
    ['biarritzmenthe','Biarritz Bonheur · Menthe','Apéritifs',[['menthe',5]],'3 gros glaçons dans un petit verre ballon.'],
    ['biarritzcitron','Biarritz Bonheur · Citron','Apéritifs',[['citron',5]],'3 gros glaçons dans un petit verre ballon.'],
    ['biarritzframboise','Biarritz Bonheur · Framboise','Apéritifs',[['framboise',5]],'3 gros glaçons dans un petit verre ballon.']
  ].map(([id,name,category,ingredients,note])=>({id,name,category,ingredients:ingredients.map(([productId,cl])=>({productId,cl})),note,price:({hugo:10,aperolspritz:9,kir:4.5,kirpetillant:8})[id]||8,tax:20,loss:0,extra:0})),
  invoice: {reference:'FA000096',date:'30/09/2026',goods:767.17,deposits:50,totalHT:817.17,totalTTC:957.49}
};
