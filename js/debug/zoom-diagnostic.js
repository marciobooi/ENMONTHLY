(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const checks = [
      {pattern:'#es_app_header', name:'Header', expectedParent:'#navbar-container'},
      {pattern:'#toggleLanguageBtn', name:'Toggle language btn', expectedParent:'#navbar-container'},
      {pattern:'#language-list-overlay', name:'Language overlay', expectedParent:'#navbar-container'},
      {pattern:'#menuToolbar', name:'Menu toolbar', expectedParent:'#subnavbar-container'},
      {pattern:'#chartOptionsMenu', name:'Chart options menu', expectedParent:'#subnavbar-container'},
      {pattern:'#closeChartMenuBtn', name:'Close chart menu btn', expectedParent:'#subnavbar-container'},
      {pattern:'#chart', name:'#chart', expectedParent:'body'},
      {pattern:'#iframeModal', name:'iframeModal dialog', expectedParent:'body'}
    ];

    const report = document.createElement('div');
    report.id = 'zoom-diagnostic-report';
    report.style = 'position:fixed;right:0;top:0;max-width:40vw;background:rgba(14,71,203,0.95);color:#fff;padding:0.5rem;z-index:999999;font-size:12px;font-family:sans-serif;opacity:0.95;max-height:90vh;overflow:auto';
    report.innerHTML = '<strong>Zoom CSS diagnostic</strong><div id="diagnostic-body" style="margin-top:0.5rem"></div>';
    document.body.appendChild(report);
    const body = report.querySelector('#diagnostic-body');

    function makeRow(text) {
      const el = document.createElement('div');
      el.style = 'padding:0.15rem 0';
      el.textContent = text;
      return el;
    }

    function checkAll() {
      body.innerHTML = '';

      checks.forEach(c=>{
        const nodes = document.querySelectorAll(c.pattern);
        if(nodes && nodes.length>0){
          // determine if any node is within expected parent
          let inExpected = false;
          const locations = [];
          nodes.forEach(n=>{
            const parent = n.closest(c.expectedParent||'body');
            if(parent) inExpected = true;
            // compute a short path for debugging
            let container = n.closest('#navbar-container, #subnavbar-container') || n.parentElement || document.body;
            let containerLabel = container.id ? `#${container.id}` : container.tagName.toLowerCase();
            locations.push(containerLabel);
          });

          const uniqueLoc = Array.from(new Set(locations)).join(', ');
          const msg = `${c.name} (${c.pattern}): FOUND (instances: ${nodes.length}) — location(s): ${uniqueLoc} — ${inExpected ? 'inside expected parent' : 'NOT inside expected parent'} `;
          body.appendChild(makeRow(msg));
        } else {
          body.appendChild(makeRow(`${c.name} (${c.pattern}): MISSING`));
        }
      });

      // Check for remaining unscoped selectors in loaded stylesheets (best-effort; may skip cross-origin sheets)
      const cssChecks = checks.map(c=>({pattern:c.pattern, pref:(c.expectedParent||'') + ' '}));
      body.appendChild(document.createElement('hr'));
      cssChecks.forEach(c=>{
        let foundUnscoped=false;
        for(const sheet of document.styleSheets){
          try{
            const rules = sheet.cssRules || sheet.rules || [];
            for(const rule of rules){
              const text = (rule.selectorText || rule.cssText || '');
              if(text && text.includes(c.pattern) && !text.includes(c.pref)){
                foundUnscoped = true; break;
              }
            }
          }catch(e){ /* ignore cross-origin or inaccessible sheets */ }
          if(foundUnscoped) break;
        }
        body.appendChild(makeRow(`Unscoped usage of ${c.pattern}: ${foundUnscoped ? 'YES' : 'NO'}`));
      });

    }

    // initial check
    checkAll();

    // observe DOM changes to detect dynamically added components
    const observer = new MutationObserver((mutations)=>{
      // simple debouncing
      if(this._diagTimeout) clearTimeout(this._diagTimeout);
      this._diagTimeout = setTimeout(()=>{
        checkAll();
      }, 150);
    });

    observer.observe(document.body, {childList:true, subtree:true});

    // stop observing after 6 seconds to avoid long-running observers
    setTimeout(()=>{
      observer.disconnect();
    }, 6000);

    // Add simple close button
    const btn = document.createElement('button');
    btn.textContent='Close';
    btn.style='display:block;margin-top:0.5rem;background:#fff;color:#0e47cb;border:none;padding:0.4rem;border-radius:3px;cursor:pointer';
    btn.addEventListener('click', ()=>report.remove());
    report.appendChild(btn);

    console.log('Zoom diagnostic initialized (will observe DOM for a few seconds).');
  });
})();
