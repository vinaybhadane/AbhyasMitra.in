import sanitizeHtml from 'sanitize-html';
export function sanitizeArticle(html: string) {
 return sanitizeHtml(html, {
  allowedTags: ['p','br','strong','b','em','i','u','s','del','h1','h2','h3','h4','h5','h6','ul','ol','li','blockquote','pre','code','hr','a','img','table','thead','tbody','tr','th','td','colgroup','col','span','div','sub','sup'],
  allowedAttributes: { '*': ['class','id'], a: ['href','title','target','rel'], img: ['src','alt','width','height'], td: ['colspan','rowspan'], th: ['colspan','rowspan'], col: ['span','width'] },
  allowedSchemes: ['https','http','mailto'], allowedSchemesByTag: { img: ['https','http'] }, allowProtocolRelative: false,
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
 });
}
export const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
