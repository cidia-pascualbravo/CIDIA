(function(){
  const meta=document.getElementById('pageMeta'),body=document.getElementById('markdownContent');
  if(!meta||!body)return;

  const params=new URLSearchParams(location.search);
  const raw=params.get('content')||'pages/about';
  const clean=raw.replace(/[^a-zA-Z0-9/_-]/g,'');

  function parseFrontMatter(text){
    const out={data:{},content:text};
    if(!text.startsWith('---'))return out;

    const end=text.indexOf('\n---',3);
    if(end<0)return out;

    const fm=text.slice(3,end).trim().split('\n');
    fm.forEach(line=>{
      const idx=line.indexOf(':');
      if(idx>0){
        const key=line.slice(0,idx).trim();
        const value=line.slice(idx+1).trim().replace(/^['"]|['"]$/g,'');
        out.data[key]=value;
      }
    });

    out.content=text.slice(end+4).trim();
    return out;
  }

  function escapeHtml(v=''){
    return String(v).replace(/[&<>'"]/g,c=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      "'":'&#39;',
      '"':'&quot;'
    }[c]));
  }

  fetch(`content/${clean}.md`)
    .then(r=>{
      if(!r.ok)throw new Error('not found');
      return r.text();
    })
    .then(text=>{
      const {data,content}=parseFrontMatter(text);

      const title=data.title||'CIDIA';
      const subtitle=data.subtitle||'';
      const eyebrow=data.eyebrow||data.category||'CIDIA / RESEARCH';
      const summary=data.summary||data.description||'';

      document.title=`${title} | CIDIA`;

      meta.innerHTML=`
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>

        <h1>${escapeHtml(title)}</h1>

        ${subtitle?`
          <p class="content-subtitle">${escapeHtml(subtitle)}</p>
        `:''}

        ${summary?`
          <p class="content-summary">${escapeHtml(summary)}</p>
        `:''}

        ${data.tags?`
          <div class="hero-tags">
            ${data.tags.split(',').map(t=>`
              <span>${escapeHtml(t.trim())}</span>
            `).join('')}
          </div>
        `:''}
      `;

      if(window.marked){
        marked.setOptions({gfm:true,breaks:false});
        body.innerHTML=marked.parse(content);
      }else{
        body.innerHTML=`<pre>${escapeHtml(content)}</pre>`;
      }

      body.querySelectorAll('a').forEach(a=>{
        const href=a.getAttribute('href');
        if(a.href.startsWith(location.origin)&&href?.endsWith('.md')){
          a.href=`page.html?content=${href
            .replace(/^content\//,'')
            .replace(/\.md$/,'')}`;
        }
      });
    })
    .catch(()=>{
      document.title='Contenido no encontrado | CIDIA';

      meta.innerHTML=`
        <p class="eyebrow">CIDIA / ERROR</p>
        <h1>Contenido no encontrado</h1>
        <p class="content-summary">
          El archivo Markdown solicitado no existe todavía.
        </p>
      `;

      body.innerHTML=`
        <p>
          Revisa el parámetro <code>?content=</code> o crea el archivo
          correspondiente dentro de <code>/content</code>.
        </p>
      `;
    });
})();