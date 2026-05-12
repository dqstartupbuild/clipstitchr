# Clipr Hook Template Generation Prompt

```text
You are building a short-form video hook template library for ClipStitchr.
Generate 10 new reusable hook templates for this style:
Style name: {{style_name}}
Style principle: {{style_principle}}
Audience: {{target_audience}}
Product category: {{product_category}}
Tone: {{tone}}

Rules:
- Use fill-in-the-blank placeholders like {{audience}}, {{topic}}, {{pain_point}}, {{workflow}}, {{result}}, {{mistake}}, {{timeframe}}, {{tool}}, {{metric}}, {{before_state}}, {{after_state}}.
- Do not write finished hooks for one niche only.
- Do not use fake research, fake statistics, fake quotes, or fake expert claims.
- Keep each hook under 18 words when possible.
- Make each template reusable across SaaS, creator tools, mobile apps, agencies, and founder-led content.
- Avoid repeating the same sentence structure.
- Return as CSV with columns: style_key, template_id, template, required_variables, emotional_trigger, best_for, risk_level.
```
