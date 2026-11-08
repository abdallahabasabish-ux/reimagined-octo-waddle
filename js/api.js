/**
 * BlogPush CORS Worker — حل جذري لمشكلة CORS
 * ==================================================
 *
 * هذا الملف يُنشر على Cloudflare Workers (مجاناً) كـ CORS proxy.
 * بحد ذاته لا يكلف شيئاً (100,000 طلب/يوم مجاناً).
 *
 * خطوات النشر:
 * 1. اذهب إلى https://dash.cloudflare.com → Workers & Pages
 * 2. اضغط "Create application" → "Create Worker"
 * 3. اسم الـ Worker: blogpush-cors
 * 4. اضغط "Deploy" ثم "Edit code"
 * 5. احذف الكود الافتراضي والصق كامل هذا الملف
 * 6. اضغط "Save and deploy"
 * 7. انسخ الرابط (مثل: https://blogpush-cors.username.workers.dev)
 * 8. افتح js/api.js في مشروع BlogPush
 * 9. ضع الرابط في BLOGPUSH_WORKER_URL بالأسفل
 *
 * ملاحظة: بدون نشر هذا الـ Worker، ستظل مشاكل CORS قائمة مع مواقع Cloudflare
 */

// ⚠️ ضع رابط الـ Worker هنا بعد النشر (مثل: https://blogpush-cors.username.workers.dev)
// إن تركته فارغاً، سيعطل التطبيق ويُرجع خطأ واضح
const BLOGPUSH_WORKER_URL = 'https://blogpush-cors.abdallahabasabish.workers.dev/'; // اتركه فارغاً — المستخدم يضع الرابط في js/api.js

/**
 * منطق الـ Worker نفسه (يُنسخ لـ Cloudflare):
 * --------------------------------------------------------------
 * export default {
 *   async fetch(request) {
 *     const url = new URL(request.url);
 *     const targetUrl = url.searchParams.get('url');
 *     if (!targetUrl) {
 *       return new Response(JSON.stringify({ ok: false, error: 'مطلوب بارامتر url' }), {
 *         status: 400,
 *         headers: corsHeaders()
 *       });
 *     }
 *     try {
 *       const res = await fetch(targetUrl, {
 *         headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
 *         redirect: 'follow'
 *       });
 *       const text = await res.text();
 *       return new Response(text, {
 *         status: res.status,
 *         headers: { ...corsHeaders(), 'Content-Type': res.headers.get('content-type') || 'text/plain' }
 *       });
 *     } catch (e) {
 *       return new Response(JSON.stringify({ ok: false, error: e.message }), {
 *         status: 502,
 *         headers: corsHeaders()
 *       });
 *     }
 *   }
 * };
 * function corsHeaders() {
 *   return {
 *     'Access-Control-Allow-Origin': '*',
 *     'Access-Control-Allow-Methods': 'GET, OPTIONS',
 *     'Access-Control-Allow-Headers': 'Content-Type'
 *   };
 * }
 */

// ============================================================
// طبقة API للواجهة (تُستخدم من js/api.js)
// ============================================================

const API = {
  /**
   * جلب محتوى URL عبر Cloudflare Worker (يتجاوز CORS كلياً)
   * @param {string} url - الرابط المستهدف
   * @returns {Promise<{ok, text, status}>}
   */
  async fetch(url) {
    // إن لم يُضبط رابط الـ Worker، نُرجع خطأ واضح
    if (!BLOGPUSH_WORKER_URL) {
      return {
        ok: false,
        error: 'لم يُضبط رابط Cloudflare Worker. افتح js/api.js وضعه في BLOGPUSH_WORKER_URL بعد نشر الـ Worker (انظر worker/README.md)'
      };
    }
    try {
      const workerUrl = BLOGPUSH_WORKER_URL + '?url=' + encodeURIComponent(url);
      const res = await fetch(workerUrl, { cache: 'no-store' });
      if (!res.ok) {
        return { ok: false, error: 'HTTP ' + res.status, status: res.status };
      }
      const text = await res.text();
      return { ok: true, text, status: res.status };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /**
   * جلب خلاصة RSS/Atom
   */
  async fetchRss(url) {
    return this.fetch(url);
  },

  /**
   * جلب HTML صفحة (للتحقق من الميتا تاج)
   */
  async fetchHtml(url) {
    return this.fetch(url);
  }
};

window.API = API;
window.BLOGPUSH_WORKER_URL = BLOGPUSH_WORKER_URL;
