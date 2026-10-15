(function(root){
  'use strict';
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  function cost(recipe, products) {
    let base=0, baseTTC=0; const warnings=[];
    for(const line of recipe.ingredients){
      const p=products.find(p=>p.id===line.productId);
      if(!p || p.price===null || !p.volume){warnings.push((p?.name||'Produit manquant')+' : coût manquant');continue;}
      const amount=p.price/p.volume*line.cl;
      base+=amount;
      baseTTC+=amount*(1+p.tax/100);
      if(!p.confirmed) warnings.push(p.name+' : contenance à confirmer');
    }
    return {value:base/(1-recipe.loss/100)+recipe.extra,ttc:baseTTC/(1-recipe.loss/100)+recipe.extra*(1+(recipe.extraTax??20)/100),warnings,complete:warnings.length===0};
  }
  function metrics(cost,price,tax){
    if(price===null || price<=0) return {net:null,margin:null,rate:null,markup:null,ratio:null};
    const net=price/(1+tax/100),margin=net-cost;
    return {net,margin,rate:margin/net*100,markup:cost?margin/cost*100:null,ratio:cost/net*100};
  }
  function targetPrice(cost,rate,tax){return rate>=100?null:cost/(1-rate/100)*(1+tax/100);}
  function validate(data){
    if(!data||data.version!==1||!Array.isArray(data.products)||!Array.isArray(data.recipes))throw Error('Format de sauvegarde non reconnu.');
    if(data.products.length>10000||data.recipes.length>10000)throw Error('Sauvegarde trop volumineuse.');
    if(data.categories!==undefined&&(!Array.isArray(data.categories)||data.categories.some(c=>typeof c!=='string'||!c.trim()||c.length>80)))throw Error('Liste de catégories invalide.');
    const ids=new Set();
    for(const p of data.products){
      if(typeof p.id!=='string'||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||typeof p.category!=='string'||typeof p.note!=='string'||typeof p.source!=='string'||typeof p.confirmed!=='boolean'||!(p.volume===null||(finite(p.volume)&&p.volume>0))||!(p.price===null||(finite(p.price)&&p.price>=0))||!finite(p.quantity)||p.quantity<0||!finite(p.tax)||p.tax<0||p.tax>100)throw Error('Produit invalide dans la sauvegarde.');
      ids.add(p.id);
    }
    const recipeIds=new Set();
    for(const r of data.recipes){
      if(typeof r.id!=='string'||recipeIds.has(r.id)||typeof r.name!=='string'||!r.name.trim()||typeof r.category!=='string'||typeof r.note!=='string'||!(r.price===null||(finite(r.price)&&r.price>0))||!finite(r.tax)||r.tax<0||r.tax>100||!finite(r.loss)||r.loss<0||r.loss>=100||!finite(r.extra)||r.extra<0||!Array.isArray(r.ingredients)||!r.ingredients.length||r.ingredients.some(l=>!ids.has(l.productId)||!finite(l.cl)||l.cl<=0))throw Error('Recette invalide ou produit introuvable.');
      if(r.extraTax!==undefined&&(!finite(r.extraTax)||r.extraTax<0||r.extraTax>100))throw Error('TVA des frais invalide.');
      recipeIds.add(r.id);
    }
    return data;
  }
  function migrate(data, seed){
    const update='moretti-formats-v1';
    let changed=false;
    data.updates=Array.isArray(data.updates)?data.updates:[];
    const copy=value=>JSON.parse(JSON.stringify(value));
    if(!data.updates.includes(update)){
    if(!data.products.some(p=>p.id==='moretti'))data.products.push(copy(seed.products.find(p=>p.id==='moretti')));
    for(const id of ['moretti-pinte','moretti-demi','moretti-pichet']){
      if(!data.recipes.some(r=>r.id===id))data.recipes.push(copy(seed.recipes.find(r=>r.id===id)));
    }
    data.updates.push(update);
    changed=true;
    }
    if(!data.updates.includes('moretti-prices-v1')){
      for(const [id,price] of Object.entries({'moretti-pinte':7,'moretti-demi':4,'moretti-pichet':13})){
        const recipe=data.recipes.find(r=>r.id===id);
        if(recipe)recipe.price=price;
      }
      data.updates.push('moretti-prices-v1');
      changed=true;
    }
    if(!data.updates.includes('defaults-2026-10-15-export-v1')){
      for(const collection of ['products','recipes']){
        for(const item of seed[collection]){
          if(!data[collection].some(current=>current.id===item.id))data[collection].push(copy(item));
        }
      }
      data.updates.push('defaults-2026-10-15-export-v1');
      changed=true;
    }
    const categories=categoryList(data);
    if(JSON.stringify(categories)!==JSON.stringify(data.categories)){data.categories=categories;changed=true;}
    return changed;
  }
  function categoryList(data){
    const names=[...(data.categories||[]),...data.products.map(p=>p.category),...data.recipes.map(r=>r.category)];
    const unique=new Map();
    for(const value of names){const name=value.trim();if(name&&!unique.has(name.toLocaleLowerCase('fr')))unique.set(name.toLocaleLowerCase('fr'),name);}
    return [...unique.values()].sort((a,b)=>a.localeCompare(b,'fr'));
  }
  function addCategory(data,value){
    const name=value.trim().replace(/\s+/g,' ');
    if(!name||name.length>80)throw Error('Saisissez un nom de catégorie de 1 à 80 caractères.');
    const categories=categoryList(data),existing=categories.find(c=>c.toLocaleLowerCase('fr')===name.toLocaleLowerCase('fr'));
    if(existing)throw Error('Cette catégorie existe déjà : '+existing);
    data.categories=[...categories,name].sort((a,b)=>a.localeCompare(b,'fr'));
    return name;
  }
  const api={cost,metrics,targetPrice,validate,migrate,categoryList,addCategory}; root.BarCore=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
