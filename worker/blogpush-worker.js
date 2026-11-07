/**
 * BlogPush CORS Worker — الحل الجذري لمشكلة CORS
 * ==================================================
 *
 * هذا الملف يُنشر على Cloudflare Workers (مجاناً) كـ CORS proxy.
 * يحمّل الموقع/الخلاصة من الخادم مباشرة ويعيدها مع CORS headers.
 *
 * خطوات النشر (5 دقائق):
 * -----------------------------------
 * 1. اذهب إلى https://dash.cloudflare.com
 * 2. سجّل حساب مجاني (إن لم يكن لديك)
 * 3. من القائمة الجانبية: Workers & Pages
 * 4. اضغط "Create application" → "Create Worker"
 * 5. اسم الـ Worker: blogpush-cors  (أي اسم)
 * 6. اضغط "Deploy"
 * 7. اضغط "Edit code"
 * 8. احذف الكود الافتراضي في الملف الأيمن
 * 9. افتح هذا الملف (worker/blogpush-worker.js)
 * 10. انسخ كامل محتوى قسم "WORKER CODE" بالأسفل والصقه
 * 11. اضغط "Save and deploy"
 * 12. انسخ الرابط (مثل: https://blogpush-cors.username.workers.dev)
 * 13. افتح js/api.js في مشروع BlogPush
 * 14. ضع الرابط في السطر: const BLOGPUSH_WORKER_URL = 'https://blogpush-cors.username.workers.dev'
 * 15. احفظ الملف وارفع التحديث لـ GitHub
 *
 * ملاحظات:
 * - Cloudflare Workers مجاني حتى 100,000 طلب/يوم (يكفي لآلاف المستخدمين)
 * - لا يحتاج بطاقة ائتمان
 * - يعمل تلقائياً مع جميع مواقع Cloudflare (freelancearab.com, blogspot.com, إلخ)
 */

/* ============================================================
   WORKER CODE — انسخ من هنا إلى نهاية الملف في Cloudflare
   ============================================================ */

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // معالجة طلبات CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return new Response(JSON.stringify({ ok: false, error: 'مطلوب بارامتر url' }), {
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7'
        },
        redirect: 'follow'
      });

      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: {
          ...corsHeaders(),
          'Content-Type': res.headers.get('content-type') || 'text/plain; charset=utf-8'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 502,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

/* ============================================================
   نهاية WORKER CODE
   ============================================================ */
