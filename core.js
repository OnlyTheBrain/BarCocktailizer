(function(root){
  'use strict';
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  function cost(recipe, products) {
    let base=0; const warnings=[];
    for(const line of recipe.ingredients){
      const p=products.find(p=>p.id===line.productId);
      if(!p || p.price===null || !p.volume){warnings.push((p?.name||'Produit manquant')+' : coût manquant');continue;}
      base+=p.price/p.volume*line.cl;
      if(!p.confirmed) warnings.push(p.name+' : contenance à confirmer');
    }
    return {value:base/(1-recipe.loss/100)+recipe.extra,warnings,complete:warnings.length===0};
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
    const ids=new Set();
    for(const p of data.products){
      if(typeof p.id!=='string'||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||typeof p.category!=='string'||typeof p.note!=='string'||typeof p.source!=='string'||typeof p.confirmed!=='boolean'||!(p.volume===null||(finite(p.volume)&&p.volume>0))||!(p.price===null||(finite(p.price)&&p.price>=0))||!finite(p.quantity)||p.quantity<0||!finite(p.tax)||p.tax<0||p.tax>100)throw Error('Produit invalide dans la sauvegarde.');
      ids.add(p.id);
    }
    const recipeIds=new Set();
    for(const r of data.recipes){
      if(typeof r.id!=='string'||recipeIds.has(r.id)||typeof r.name!=='string'||!r.name.trim()||typeof r.category!=='string'||typeof r.note!=='string'||!(r.price===null||(finite(r.price)&&r.price>0))||!finite(r.tax)||r.tax<0||r.tax>100||!finite(r.loss)||r.loss<0||r.loss>=100||!finite(r.extra)||r.extra<0||!Array.isArray(r.ingredients)||!r.ingredients.length||r.ingredients.some(l=>!ids.has(l.productId)||!finite(l.cl)||l.cl<=0))throw Error('Recette invalide ou produit introuvable.');
      recipeIds.add(r.id);
    }
    return data;
  }
  const api={cost,metrics,targetPrice,validate}; root.BarCore=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
