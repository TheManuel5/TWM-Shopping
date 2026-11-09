import { createServer } from 'vite'
import { mkdir,writeFile,copyFile } from 'node:fs/promises'
import path from 'node:path'
const server=await createServer({root:path.resolve('frontend'),define:{'import.meta.env.VITE_DATA_MODE':JSON.stringify('demo')},server:{middlewareMode:true},appType:'custom'})
try {
 const {catalogSeed}=await server.ssrLoadModule('/src/data/catalog.js')
 const {CATEGORY_TREE}=await server.ssrLoadModule('/src/utils/taxonomyData.js')
 const {default:users}=await server.ssrLoadModule('/src/data/usersSeed.js')
 const {default:companies}=await server.ssrLoadModule('/src/data/companiesSeed.js')
 await mkdir('frontend/public/catalog',{recursive:true})
 for(const row of catalogSeed) {const source=row.imagen.split('?')[0]; const name=path.basename(source);await copyFile(path.join('frontend',source.replace(/^\//,'')),path.join('frontend/public/catalog',name));row.imagen='/catalog/'+name;row.ownerRut='12345678-5'}
 const seed={catalog:catalogSeed,categories:CATEGORY_TREE,users,companies:companies.map(c=>({...c,ownerRut:'12345678-5'})),zones:[{id:1,region:'Los Lagos',provincia:'Osorno',comuna:'Osorno',rate:3570},{id:2,region:'Los Lagos',provincia:'Llanquihue',comuna:'Puerto Montt',rate:4760},{id:3,region:'Los Ríos',provincia:'Valdivia',comuna:'Valdivia',rate:5950}],shippingMethod:'zona','addresses:12345678-5':[{id:'DIR-001',name:'Casa',street:'Av. Manuel Rodríguez',number:'1234',commune:'Osorno',region:'Los Lagos',province:'Osorno',primary:true}],orders:[],quotes:[],returns:[],messages:[],conversations:[]}
 seed.zones=seed.zones.map(zone=>({...zone,ownerRut:'12345678-5'}))
 await writeFile('backend/TWM.API/src/Seeds/store.json',JSON.stringify(seed,null,2))
}finally{await server.close()}
