function comparisonSafe(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
// Optional table.section places a table directly under the image section with the same title.
function comparisonArticles(tables,prefix){
 const safe=comparisonSafe;
 return tables.map((table,index)=>`<article class="comparison-block"><h3 id="${prefix}-${index}">${safe(t(table.title))}</h3><p class="comparison-context">${safe(t(table.context))}</p>${table.explanation?`<p class="comparison-explanation">${safe(t(table.explanation))}</p>`:''}<div class="comparison-scroll" role="region" aria-labelledby="${prefix}-${index}" tabindex="0"><table><thead><tr>${table.columns.map(column=>`<th scope="col">${safe(t(column))}</th>`).join('')}</tr></thead><tbody>${table.rows.map((row,i)=>`<tr class="${i===table.referenceRow?'comparison-reference':''}">${row.map((cell,j)=>j===0?`<th scope="row">${safe(t(String(cell)))}${i===table.referenceRow?`<small>${t('Reference case')}</small>`:''}</th>`:`<td>${safe(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${table.formula?`<div class="image-formula comparison-formula"><strong>${t('Related formula')}</strong><code>${safe(table.formula)}</code>${table.formulaSymbols?`<p>${safe(table.formulaSymbols)}</p>`:''}</div>`:''}<p class="comparison-insight">${safe(t(table.insight))}</p><small class="comparison-source">${t('Source')}: ${safe(table.source)}</small></article>`).join('');
}
function renderComparisons(project){
 const tables=project.comparisons;if(!Array.isArray(tables)||!tables.length)return '';
 return `<section class="result-comparisons"><h2>${t(project.resultsFirst?'Results in numbers':'Compared results')}</h2><p class="comparison-intro">${comparisonSafe(t(project.comparisonIntro || 'Temperature values are device-surrogate body maxima, not validated junction temperatures.'))}</p>${comparisonArticles(tables,'comparison')}</section>`;
}
