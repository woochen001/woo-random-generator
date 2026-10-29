# Random Tools — Wasmer + Supabase

Static website with fictional identity generation and three word modes:

- Supabase word bank (recommended for large word lists)
- Local `public/words.txt`
- Random strings made from the 26 English letters (length 1–100)

## 1. Deploy the site to Wasmer

Upload/deploy the project root containing `Staticfile`, `app.yaml`, `settings/`, and `public/`. The static root is `public`.

## 2. Set up Supabase (optional)

1. Create a project at https://supabase.com/. Free plan currently has 500 MB database quota per project; check current pricing/limits before importing.
2. Open SQL Editor and run `supabase-setup.sql`.
3. In Project Settings / API (or Integrations > Data API), copy the Project URL and the **publishable key** (or legacy `anon` key).
4. Edit `public/supabase-config.js` and replace `YOUR_PROJECT_REF` and `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY`. Never put a `service_role` or secret key in a public website.
5. Import your word list into `public.words`, with a single `word` column. For Dashboard CSV import, prepare a CSV with header `word` and one word per row, e.g. `word\nthe\nof\nand`. If your source is a quoted comma-separated list, convert it to one word per row before importing. Dashboard CSV import currently documents a 100 MB limit; larger imports may need another import method.
6. In the site, choose **Supabase word bank**. Random generation calls the `random_word()` database function; search uses the `words` table.

## 3. Local word file

Put your own vocabulary in `public/words.txt`. Comma-separated entries such as `"the", "of", "and", "to"` are supported. The browser loads the whole local file, so for very large files Supabase mode is generally preferable.

## Random letters

Choose **Random letters (a–z)** and set a length from 1 to 100. This mode is client-side and does not need a database or network.

## Important

- The word bank only stores words, not definitions, examples, or audio.
- Supabase Free projects can pause after one week of inactivity.
- `random_word()` uses `ORDER BY random()`, which is straightforward for a personal word bank but can become slower for extremely large tables.

### 怎么启用 Supabase

1. 在 [Supabase](https://supabase.com/?utm_source=chatgpt.com) 创建免费项目。

2. 打开 ZIP 中的 `supabase-setup.sql`，将里面的 SQL 复制到 Supabase 的 SQL Editor 并执行。

3. 将你的词库整理成一行一个单词的 CSV，例如：
   
   ```
   word
   the
   of
   and
   to
   ```

4. 在 Supabase 的 `words` 表中导入词库。

5. 修改 `public/supabase-config.js`，填入项目 URL 和公开的 publishable key（或旧版 anon key）。不要把 `service_role` 密钥放进网站。

6. 将新版网站重新部署到 Wasmer。





如果不能取词，在 Supabase 的 SQL Editor → New query 中，粘贴并运行以下完整代码：

```
CREATE OR REPLACE FUNCTION public.random_word()
RETURNS text
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT w.word
  FROM public.word AS w
  WHERE w.word IS NOT NULL
    AND btrim(w.word) <> ''
  ORDER BY random()
  LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.random_word() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.random_word() TO anon;
GRANT EXECUTE ON FUNCTION public.random_word() TO authenticated;

NOTIFY pgrst, 'reload schema';
```
