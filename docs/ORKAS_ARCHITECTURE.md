# Orkas-inspired Architecture

## Execution flow

```text
User
  |
  v
Commander
  |
  +--> decide: respond / dispatch / plan
  |
  v
Structured Dispatcher
  |
  +--> Worker A ----+
  +--> Worker B ----+--> Verification --> Result
  +--> Worker C ----+
                         |
                         v
                    Reflection
                     /       \
                  Memory    Skills
```

## اصول

1. Commander فقط orchestration و تصمیم سطح بالا را انجام می‌دهد.
2. Dispatch یک پیام ساختاری است و نباید با متن آزاد Agent اشتباه شود.
3. Agentها فقط Context قابل مشاهده خود را دریافت می‌کنند.
4. کارهای مستقل موازی اجرا می‌شوند؛ وابسته‌ها ترتیبی هستند.
5. Plan وضعیت مشترک کار را نگه می‌دارد.
6. خروجی قبل از تحویل باید Verification شود.
7. تجربه موفق به Memory و در صورت تکرار به Skill تبدیل می‌شود.
8. Model Router بر اساس کیفیت، هزینه و latency انتخاب انجام می‌دهد.
9. External Agentها از طریق Adapter به Runtime متصل می‌شوند.

## تفاوت با Orkas

این پروژه کپی Desktop Application اورکاس نیست. معماری‌های orchestration، delegation، visibility، memory، evolution و verification به‌صورت مستقل روی پلتفرم SaaS/Agent Manager پیاده می‌شوند.
