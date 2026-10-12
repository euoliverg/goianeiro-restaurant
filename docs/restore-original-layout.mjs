// Undo the 12 Oct 2026 reorganization: moves files back from media/ to their old _source/ and marketing/ paths.
// Only the 20 MOVED files are listed; the 23 COPIED files were never removed from their original place.
// Usage (from the project root):  node docs/restore-original-layout.mjs        (dry run)
//                                 node docs/restore-original-layout.mjs --apply
import { existsSync, mkdirSync, renameSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
const MOVES = [
 [
  "media/menu/buffet/buffet-overhead-trays.jpg",
  "_source/buffet-overhead.jpg",
  "1d5552f7a19c43dad527330a8c999f5b993f907c126157dd0e2af4ed1bf58fac"
 ],
 [
  "media/menu/buffet/buffet-line-trays.jpg",
  "_source/buffet-line.jpg",
  "57628b9bb43b05127d7bf85d85439fcaf45a20828bd2f74da7fc2c4448f6e83e"
 ],
 [
  "media/menu/buffet/feijao-tropeiro-main.jpg",
  "_source/feijao-tropeiro.jpg",
  "5f638ee663eee20ef87b2c30ffaf4651a80e92e6e66cfd556db988482957fe6c"
 ],
 [
  "media/menu/sides/torresmo-mandioca-frita-couve.jpg",
  "_source/mandioca-torresmo.jpg",
  "167ba17ec3226ecc4474c2649d62ddf3f58caa0a907f23233ad4528bbf8bf852"
 ],
 [
  "media/menu/brazilian-plates/na-chapa-sizzling-steak-fries-cheese.jpg",
  "_source/chapa.jpg",
  "472f8f101d733a6cc79e00f0c3b514774c62c2487b13bc93b3d96010324ff99f"
 ],
 [
  "media/menu/brazilian-plates/marmita-de-churrasco-takeout-01.jpg",
  "_source/marmita.jpg",
  "a539e95d00d9f93c099f07a0196ac1760219c1c9b12aabe907b8fbdd7e8bd212"
 ],
 [
  "media/menu/breakfast/pao-de-queijo-main.jpg",
  "_source/pao-de-queijo.jpg",
  "dfc5bfad68ecb5c0b03eb653f38f6bb65d4259b1990b55d8ae125e3791bb5385"
 ],
 [
  "media/menu/desserts/pudim-de-leite-main.jpg",
  "_source/pudim.jpg",
  "1ab9cbcf7ccffcd6dd3c3de60522ca27c49e4509f079224d3a3b1dd025eda4f9"
 ],
 [
  "media/menu/desserts/pave-strawberries-and-dessert-cups.jpg",
  "_source/pave-morango.jpg",
  "4966ef624481df37881d49fa48c2a659ad238b82d1cf6935bbd09df7e546dc1a"
 ],
 [
  "media/menu/desserts/chocolate-and-cream-01.jpg",
  "_source/pave-chocolate.jpg",
  "03ad2734b5d38c21ad6b485f34b30bfb4a12d0bc614dfcaac8d1c025cf758907"
 ],
 [
  "media/brand/logos/goianeiro-logo-original-artwork.jpg",
  "_source/logo-original.jpg",
  "8930ee7033ec439522d6a84df71a161cf011c202bbbcad644fac3368d7434773"
 ],
 [
  "media/videos/promotional/hero-brand-film-google-flow-original.mp4",
  "_source/hero-flow-original.mp4",
  "5ac05d17def0082613e61e813855130ec00f055089489fb7405713fa9b3d0fca"
 ],
 [
  "media/social-media/instagram-reels/goianeiro-menu-reel-2026-10.mp4",
  "marketing/goianeiro-reels-final.mp4",
  "88c5c34f14e298ba60c67f2bac09af01ca31b0154e1433f3d9e5914d7268d2cf"
 ],
 [
  "media/social-media/thumbnails/goianeiro-menu-reel-cover.jpg",
  "marketing/goianeiro-reels-capa.jpg",
  "0b7e586e31b74885b983fb4a4a9c72a58f75d0ba648cc22b899afb9b8a7c7a6f"
 ],
 [
  "media/social-media/audio/goianeiro-menu-reel-original-soundtrack.m4a",
  "marketing/goianeiro-trilha-original.m4a",
  "2708614b60fe9013b01d655ae5e97dadd71d8c98882738934dd2db036dc125d3"
 ],
 [
  "media/social-media/instagram-reels/goianeiro-brazilian-burger-reel-2026-10.mp4",
  "marketing/goianeiro-burger-reel.mp4",
  "de3e590fead414021b4490e7ed77eb1cc2479c43a0627e13be3da84ae646aac3"
 ],
 [
  "media/social-media/thumbnails/goianeiro-brazilian-burger-reel-cover.jpg",
  "marketing/goianeiro-burger-reel-capa.jpg",
  "8c978b30e04a3bacf127deb129b69d039d1a28ac374dcf7df4355d0ff909dccb"
 ],
 [
  "media/social-media/instagram-reels/previous-versions/goianeiro-menu-reel-v1-original-audio.mp4",
  "marketing/versoes-anteriores/goianeiro-reels-menu-1080x1920.mp4",
  "17785f276a077d589ad9e5bdef39aa95fa87622ae15e35d3abd9894dc26f8971"
 ],
 [
  "media/social-media/instagram-reels/previous-versions/goianeiro-menu-reel-v2-music.mp4",
  "marketing/versoes-anteriores/goianeiro-reels-menu-1080x1920-musica.mp4",
  "5ebbcc16681d75535887203f01d5967c1849eb21eb98b23dd31c0ca98653bae6"
 ],
 [
  "media/social-media/instagram-reels/previous-versions/goianeiro-menu-reel-v3-music-sfx.mp4",
  "marketing/versoes-anteriores/goianeiro-reels-menu-1080x1920-musica-sfx.mp4",
  "f560694f6fa0c51fce0fc18bd40f8d121b2bdfde36db120a740c3cbca9d0c374"
 ]
];
const apply = process.argv.includes('--apply');
for (const [now, before, sha] of MOVES) {
  if (!existsSync(now)) { console.log('missing (skipped):', now); continue; }
  if (existsSync(before)) { console.log('target exists (skipped):', before); continue; }
  if (createHash('sha256').update(readFileSync(now)).digest('hex') !== sha) { console.log('content changed since the move (skipped):', now); continue; }
  console.log((apply ? 'restored: ' : 'would restore: ') + now + ' -> ' + before);
  if (apply) { mkdirSync(dirname(before), { recursive: true }); renameSync(now, before); }
}
