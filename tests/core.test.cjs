const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');
require('../seed.js');
const db = globalThis.BAR_SEED;
const approx=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('Données sources valides : 20 produits et 20 recettes',()=>{core.validate(db);assert.equal(db.products.length,20);assert.equal(db.recipes.length,20);});
test('Formats Moretti : doses, coûts et prix TTC confirmés',()=>{for(const [id,cl,value,price] of [['moretti-pinte',50,2.09,7],['moretti-demi',25,1.045,4],['moretti-pichet',100,4.18,13]]){const r=db.recipes.find(r=>r.id===id);assert.equal(r.ingredients[0].cl,cl);assert.equal(r.price,price);approx(core.cost(r,db.products).value,value);}});
test('Prix Moretti appliqués aux formats déjà ajoutés, une seule fois',()=>{const old=structuredClone(db);old.updates=['moretti-formats-v1'];old.recipes.find(r=>r.id==='moretti-pinte').price=null;assert.equal(core.migrate(old,db),true);const r=old.recipes.find(r=>r.id==='moretti-pinte');assert.equal(r.price,7);r.price=8;assert.equal(core.migrate(old,db),false);assert.equal(r.price,8);});
test('Mise à jour des anciennes sauvegardes sans écraser les saisies ni réajouter les suppressions ultérieures',()=>{const old=structuredClone(db);delete old.updates;old.recipes=old.recipes.filter(r=>!r.id.startsWith('moretti-'));old.recipes[0].price=12;old.products[0].price=40;assert.equal(core.migrate(old,db),true);core.validate(old);assert.equal(old.recipes.length,20);assert.equal(old.recipes[0].price,12);assert.equal(old.products[0].price,40);old.recipes=old.recipes.filter(r=>r.id!=='moretti-pinte');assert.equal(core.migrate(old,db),false);assert.equal(old.recipes.length,19);});
test('Total des boissons et consignes conforme à la facture',()=>{const goods=db.products.filter(p=>p.id!=='perrier').reduce((n,p)=>n+p.price*p.quantity,0);approx(goods,767.17);approx(goods+50,817.17);});
test('Fût Moretti : facturation au litre convertie en fût de 8 litres',()=>{const p=db.products.find(p=>p.id==='moretti');approx(p.price/p.volume*50,2.09);assert.equal(p.quantity,3);});
test('Hugo : ingrédients, HT/TTC, marge sur vente HT',()=>{const r=db.recipes[0],c=core.cost(r,db.products),m=core.metrics(c.value,r.price,r.tax);approx(c.value,18.25/70*4+7.7/75*6+1.11/33*6);assert.equal(c.complete,true);approx(m.net,10/1.2);approx(m.margin,m.net-c.value);approx(m.rate,m.margin/m.net*100);});
test('Cible de taux de marque réversible',()=>{const price=core.targetPrice(2,75,20);approx(price,9.6);approx(core.metrics(2,price,20).rate,75);assert.equal(core.targetPrice(2,100,20),null);});
test('Pertes et frais par verre',()=>{const r={ingredients:[{productId:'aperol',cl:10}],loss:10,extra:0.25};approx(core.cost(r,db.products).value,1.795/0.9+0.25);});
test('Prix absent, négatif et coût nul',()=>{assert.equal(core.metrics(2,null,20).rate,null);assert.equal(core.metrics(2,0,20).margin,null);assert.ok(core.metrics(10,5,20).margin<0);assert.equal(core.metrics(0,5,20).rate,100);});
test('Ingrédient inconnu ou non chiffré bloque le statut complet',()=>{const missing={ingredients:[{productId:'absent',cl:2}],loss:0,extra:0};assert.equal(core.cost(missing,db.products).complete,false);const products=structuredClone(db.products);products[0].price=null;missing.ingredients[0].productId=products[0].id;assert.equal(core.cost(missing,products).complete,false);});
test('Import rejette doublons, valeurs négatives, références cassées, types invalides',()=>{for(const mutate of [d=>d.products.push(d.products[0]),d=>d.products[0].volume=0,d=>d.products[0].price=-1,d=>d.recipes[0].ingredients[0].productId='absent',d=>d.recipes[0].loss=100,d=>d.recipes[0].extra=Infinity,d=>d.recipes[0].ingredients=[],d=>d.products[0].name={}]){const d=structuredClone(db);mutate(d);assert.throws(()=>core.validate(d));}});
test('JSON exporté compatible avec la restauration',()=>{assert.deepEqual(core.validate(JSON.parse(JSON.stringify(db))),db);});

test('Coût TTC : TVA propre aux ingrédients, pertes et TVA des frais',()=>{
 const products=[{id:'a',price:10,volume:100,tax:20,confirmed:true},{id:'b',price:5,volume:100,tax:5.5,confirmed:true}];
 const r={ingredients:[{productId:'a',cl:10},{productId:'b',cl:20}],loss:10,extra:0.5,extraTax:10,tax:20};
 const c=core.cost(r,products);approx(c.value,2/0.9+0.5);approx(c.ttc,(1.2+1.055)/0.9+0.55);
 r.tax=5.5;approx(core.cost(r,products).ttc,c.ttc);
});
test('Anciennes recettes : TVA des frais par défaut et coût TTC partiel',()=>{
 const r={ingredients:[{productId:'absent',cl:10}],loss:0,extra:1};
 const c=core.cost(r,db.products);approx(c.ttc,1.2);assert.equal(c.complete,false);
});
test('Catégories : création, doublons, validation et export',()=>{
 const data=structuredClone(db);assert.equal(core.addCategory(data,'  Sans   alcool  '),'Sans alcool');
 assert.throws(()=>core.addCategory(data,'SANS ALCOOL'));assert.throws(()=>core.addCategory(data,' '));
 assert.ok(core.categoryList(data).includes('Vins'));assert.ok(core.validate(JSON.parse(JSON.stringify(data))).categories.includes('Sans alcool'));
 data.categories=[{}];assert.throws(()=>core.validate(data));
});
test('Migration des vins : ajouts uniques sans écraser les recettes modifiées',()=>{
 const data=structuredClone(db);data.updates=data.updates.filter(x=>x!=='defaults-2026-10-15-export-v1');
 data.recipes=data.recipes.slice(0,11);data.recipes[10].price=6;delete data.categories;
 assert.equal(core.migrate(data,db),true);assert.equal(data.recipes.length,20);assert.equal(data.recipes[10].price,6);
 data.recipes.pop();assert.equal(core.migrate(data,db),false);assert.equal(data.recipes.length,19);core.validate(data);
});
test('TVA des frais invalide rejetée',()=>{
 const data=structuredClone(db);data.recipes[0].extraTax=-1;assert.throws(()=>core.validate(data));
});

test('Non défini : toujours présente, première et protégée',()=>{
 const data=structuredClone(db);data.categories=[];
 assert.equal(core.categoryList(data)[0],'Non défini');
 for(const name of ['Non défini','  NON   DÉFINI  ']){
  assert.throws(()=>core.renameCategory(data,name,'Autre'));
  assert.throws(()=>core.deleteCategory(data,name));
  assert.throws(()=>core.addCategory(data,name));
 }
});
test('Renommage : propagation aux produits et boissons sans changer leurs autres données',()=>{
 const data=structuredClone(db),before=structuredClone(db);
 assert.equal(core.renameCategory(data,'Vins',' Vins   tranquilles '),'Vins tranquilles');
 for(const collection of ['products','recipes']){
  data[collection].forEach((item,i)=>assert.deepEqual(item,{...before[collection][i],category:before[collection][i].category==='Vins'?'Vins tranquilles':before[collection][i].category}));
 }
 assert.ok(!core.categoryList(data).includes('Vins'));assert.equal(core.migrate(data,db),false);
});
test('Renommage : collisions, noms vides et catégorie absente sans mutation',()=>{
 const data=structuredClone(db),before=structuredClone(db);
 for(const [from,to] of [['Vins','Bières'],['Vins','non défini'],['Vins',' '],['Vins','a'.repeat(81)],['Absente','Autre']]){
  assert.throws(()=>core.renameCategory(data,from,to));assert.deepEqual(data,before);
 }
});
test('Suppression : reclassement sûr, sauvegarde et absence de résurrection',()=>{
 const data=structuredClone(db),before=structuredClone(db);
 core.deleteCategory(data,'Vins');
 for(const collection of ['products','recipes']){
  assert.equal(data[collection].length,before[collection].length);
  data[collection].forEach((item,i)=>assert.deepEqual(item,{...before[collection][i],category:before[collection][i].category==='Vins'?'Non défini':before[collection][i].category}));
 }
 const restored=core.validate(JSON.parse(JSON.stringify(data)));
 assert.equal(core.migrate(restored,db),false);assert.ok(!core.categoryList(restored).includes('Vins'));
 core.addCategory(restored,'Vide');core.deleteCategory(restored,'Vide');assert.ok(!core.categoryList(restored).includes('Vide'));
});
test('Migration des catégories vides et variantes de Non défini',()=>{
 const data=structuredClone(db);delete data.categories;
 data.products[0].category=' ';data.recipes[0].category=' NON   DÉFINI ';
 assert.equal(core.migrate(data,db),true);
 assert.equal(data.products[0].category,'Non défini');assert.equal(data.recipes[0].category,'Non défini');
 assert.equal(data.categories.filter(c=>c==='Non défini').length,1);
 assert.equal(core.migrate(data,db),false);
});

test('Tri numérique HT, TTC, prix et marge dans les deux sens',()=>{
 const products=[{id:'a',price:10,volume:100,tax:20,confirmed:true},{id:'b',price:11,volume:100,tax:0,confirmed:true}];
 const make=(id,productId,price)=>({id,ingredients:[{productId,cl:10}],loss:0,extra:0,price,tax:20});
 const rows=[make('a','a',10),make('b','b',2),make('unknown','missing',null)];
 assert.deepEqual(core.sortRecipes(rows,products,'costHT').map(r=>r.id),['a','b','unknown']);
 assert.deepEqual(core.sortRecipes(rows,products,'costTTC').map(r=>r.id),['b','a','unknown']);
 assert.deepEqual(core.sortRecipes(rows,products,'price').map(r=>r.id),['b','a','unknown']);
 assert.deepEqual(core.sortRecipes(rows,products,'rate').map(r=>r.id),['b','a','unknown']);
 for(const key of ['costHT','costTTC','price','rate']){
  const asc=core.sortRecipes(rows,products,key),desc=core.sortRecipes(rows,products,key,'desc');
  assert.deepEqual(desc.map(r=>r.id),[asc[1].id,asc[0].id,'unknown']);
 }
 assert.deepEqual(rows.map(r=>r.id),['a','b','unknown']);
});
test('Tri stable : zéros, égalités, valeurs absentes et liste vide',()=>{
 const make=(id,price)=>({id,ingredients:[{productId:'moretti',cl:25}],loss:0,extra:0,price,tax:20});
 const rows=[make('b',4),make('a',4),make('c',null)];
 assert.deepEqual(core.sortRecipes(rows,db.products,'price','desc').map(r=>r.id),['b','a','c']);
 assert.deepEqual(core.sortRecipes([],db.products,'rate'),[]);
 assert.deepEqual(core.sortRecipes(rows,db.products,''),rows);
});
